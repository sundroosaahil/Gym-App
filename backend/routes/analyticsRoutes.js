const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const requireAuth = require('../middleware/requireAuth');

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
router.get('/revenue-at-risk', async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const members = await Member.find({
      endDate: { $gte: now, $lte: sevenDaysFromNow },
      renewalIntent: 'continuing'
    }).select('name gymCode endDate amountPaid');

    const totalAtRisk = members.reduce((sum, m) => sum + m.amountPaid, 0);

    res.json({ members, totalAtRisk, count: members.length });
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

module.exports = router;