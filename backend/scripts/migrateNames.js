// One-time migration: backfills firstName/lastName on existing members from
// the legacy `name` field. Splits on the first space — "Aamir Dar" becomes
// firstName="Aamir", lastName="Dar". Names with no space (e.g. "Adil") get
// firstName=name, lastName="" — left blank on purpose rather than guessed,
// so the "No last name" badge in the UI can flag them for the manager to
// fill in next time that member visits.
//
// DRY RUN BY DEFAULT — prints what it *would* change without touching the
// database. Review the list carefully: multi-word names like "Adil Ahmad
// Bhat" split as firstName="Adil", lastName="Ahmad Bhat", which may not be
// what you want for every member. Only pass --confirm once you've checked
// the output.
//
// Usage:
//   node scripts/migrateNames.js            (dry run — just prints)
//   node scripts/migrateNames.js --confirm  (actually writes to the DB)

const mongoose = require('mongoose');
require('dotenv').config();
const Member = require('../models/Member');

const CONFIRM = process.argv.includes('--confirm');

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);

  // Only members that haven't been migrated yet — safe to re-run this
  // script any number of times without touching already-migrated members.
  const members = await Member.find({
    firstName: { $exists: false },
    name: { $exists: true, $ne: null }
  });

  if (members.length === 0) {
    console.log('No members need migrating. Nothing to do.');
    process.exit(0);
  }

  console.log(`Found ${members.length} member(s) to migrate.\n`);

  let noLastName = 0;

  for (const member of members) {
    const trimmed = (member.name || '').trim();
    const firstSpaceIndex = trimmed.indexOf(' ');

    let firstName;
    let lastName;

    if (firstSpaceIndex === -1) {
      firstName = trimmed;
      lastName = '';
      noLastName++;
    } else {
      firstName = trimmed.slice(0, firstSpaceIndex);
      lastName = trimmed.slice(firstSpaceIndex + 1).trim();
    }

    console.log(
      `${CONFIRM ? 'Updating' : '[dry run] Would update'}: "${member.name}" (${member.gymCode}) -> firstName="${firstName}", lastName="${lastName}"`
    );

    if (CONFIRM) {
      member.firstName = firstName;
      member.lastName = lastName;
      await member.save();
    }
  }

  console.log(`\n${noLastName} member(s) will have a blank lastName (single-word names) — these will show the "No last name" badge.`);

  if (!CONFIRM) {
    console.log('\nThis was a DRY RUN — nothing was saved. Review the list above, then re-run with --confirm to apply.');
  } else {
    console.log('\nDone. All listed members have been updated.');
  }

  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});