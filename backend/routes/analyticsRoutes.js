const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const requireAuth = require('../middleware/requireAuth');
const calculateStatus = require('../utils/calculateStatus');

router.use(requireAuth);

// Shared dedup logic, reused by /revenue and /leaderboard.
// Why: receipts don't have a unique _id (schema has { _id: false }), and
// receiptNo isn't required. When staff mis-type an amount (e.g. 12000
// instead of 1200) they re-submit with the SAME receiptNo. Without this,
// both entries get summed, double-counting the mistake.
//
// Rule: group by (member, receiptNo), keep only the most recent by date.
// Receipts with no receiptNo are left alone — there's nothing to compare
// them against, so treating them as "already correct" is the safer default.
const DEDUP_RECEIPTS_STAGES = [
  { $unwind: { path: '$receipts', includeArrayIndex: 'receiptIndex' } },
  {
    $addFields: {
      dedupeKey: {
        $ifNull: ['$receipts.receiptNo', { $concat: ['__no-receipt-no__', { $toString: '$receiptIndex' }] }]
      }
    }
  },
  { $sort: { 'receipts.date': -1 } }, // latest date first, so $first below keeps the newest
  {
    $group: {
      _id: { memberId: '$_id', dedupeKey: '$dedupeKey' },
      memberId: { $first: '$_id' },
      name: { $first: '$name' },
      gymCode: { $first: '$gymCode' },
      amount: { $first: '$receipts.amount' },
      date: { $first: '$receipts.date' }
    }
  }
];

// Revenue: last 12 months, based on deduped receipts[].amount.
// Read-only — never writes to Member, so removing this file changes nothing else.
router.get('/revenue', async (req, res) => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const result = await Member.aggregate([
      ...DEDUP_RECEIPTS_STAGES,
      { $match: { date: { $gte: twelveMonthsAgo, $lt: startOfNextMonth } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Fill in every month, even ones with zero revenue, so the chart doesn't
    // silently skip a bar — a missing month should look like "₹0", not vanish.
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const match = result.find((r) => r._id.year === d.getFullYear() && r._id.month === d.getMonth() + 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short' }),
        total: match ? match.total : 0
      });
    }

    const thisMonth = months[months.length - 1].total;
    const lastMonth = months[months.length - 2].total;
    const percentChange = lastMonth === 0
      ? null
      : Math.round(((thisMonth - lastMonth) / lastMonth) * 100);

    res.json({ months, thisMonth, lastMonth, percentChange });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// New joins per month, last 12 months (including months with zero joins).
router.get('/new-joins', async (req, res) => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const result = await Member.aggregate([
      { $match: { startDate: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$startDate' }, month: { $month: '$startDate' } },
          count: { $sum: 1 }
        }
      }
    ]);

    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const match = result.find((r) => r._id.year === d.getFullYear() && r._id.month === d.getMonth() + 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short' }),
        count: match ? match.count : 0
      });
    }

    res.json(months);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Revenue at risk: members expiring within 7 days who are still marked "continuing".
// Revenue at risk: members currently in the "pending" grace window —
// already past endDate, within the same day-range calculateStatus() treats
// as pending elsewhere in the app, and not marked not_renewing.
//
// Reuses calculateStatus() instead of re-deriving the day math here, so this
// number always matches the "pending" badge members see on the dashboard —
// if the grace period ever changes in calculateStatus.js, this updates too.
router.get('/revenue-at-risk', async (req, res) => {
  try {
    const now = new Date();

    // DB-level filter is intentionally loose (just "already expired, still
    // continuing") — cheap on a small dataset, and avoids duplicating the
    // exact day-boundary logic that already lives in calculateStatus().
    const candidates = await Member.find({
      endDate: { $lte: now },
      renewalIntent: 'continuing'
    }).select('endDate amountPaid renewalIntent');

    const pendingMembers = candidates.filter((m) => calculateStatus(m).status === 'pending');
    const totalAtRisk = pendingMembers.reduce((sum, m) => sum + m.amountPaid, 0);
    const count = pendingMembers.length;
    const averageAtRisk = count === 0 ? 0 : Math.round(totalAtRisk / count);

    // Breakdown by how many days into the 7-day grace period each member is.
    // Day 0-1 = just lapsed, plenty of time. Day 6-7 = about to flip to
    // "inactive" — this is the number that tells you where to focus today,
    // without listing individual names (that's already on the member list).
    const byDay = {};
    for (let d = 0; d <= 7; d++) byDay[d] = 0;
    pendingMembers.forEach((m) => {
      const { daysPastExpiry } = calculateStatus(m);
      if (byDay[daysPastExpiry] !== undefined) byDay[daysPastExpiry]++;
    });
    const breakdown = Object.entries(byDay).map(([day, memberCount]) => ({
      day: Number(day),
      count: memberCount
    }));

    res.json({ count, totalAtRisk, averageAtRisk, breakdown });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leaderboard: top 10 members by total amount recorded in receipts (deduped).
// NOTE: only reflects payments logged since the receipt feature launched —
// older members' full history isn't captured here. Frontend shows this caveat.
router.get('/leaderboard', async (req, res) => {
  try {
    const result = await Member.aggregate([
      ...DEDUP_RECEIPTS_STAGES,
      {
        $group: {
          _id: '$memberId',
          name: { $first: '$name' },
          gymCode: { $first: '$gymCode' },
          totalPaid: { $sum: '$amount' },
          paymentCount: { $sum: 1 }
        }
      },
      { $sort: { totalPaid: -1 } },
      { $limit: 10 }
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Member status breakdown: active / pending / inactive / not_renewing counts.
// Reuses calculateStatus() — same reasoning as revenue-at-risk: one source
// of truth for what "pending" etc. means, so this never drifts from the
// status badges shown on the member list.
router.get('/member-status', async (req, res) => {
  try {
    const members = await Member.find().select('endDate renewalIntent');

    const counts = { active: 0, pending: 0, inactive: 0, not_renewing: 0 };
    members.forEach((m) => {
      const { status } = calculateStatus(m);
      if (counts[status] !== undefined) counts[status]++;
    });

    res.json(counts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;