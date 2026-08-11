function calculateStatus(member) {
  const today = new Date();
  const endDate = new Date(member.endDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysPastExpiry = Math.floor((today - endDate) / msPerDay);

  if (member.renewalIntent === 'not_renewing') {
    return { status: 'not_renewing', daysPastExpiry };
  }

  if (daysPastExpiry < 0) {
    return { status: 'active', daysPastExpiry };
  } else if (daysPastExpiry <= 7) {
    return { status: 'pending', daysPastExpiry };
  } else {
    return { status: 'inactive', daysPastExpiry };
  }
}

module.exports = calculateStatus;