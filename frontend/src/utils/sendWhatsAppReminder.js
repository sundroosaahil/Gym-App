// Builds a wa.me link that opens WhatsApp with a fee-reminder message
// pre-filled for a given member. Staff still has to press send manually —
// this is intentional (free, no WhatsApp API, no ban risk).
export function buildWhatsAppReminderLink(member) {
  const message = `Hi ${member.name}, hope you're doing well! This is a friendly reminder from BodyWorks Gym that your membership fee is currently pending. Kindly clear it at your earliest convenience so we can keep your membership active without any interruption. If you've already made the payment, please ignore this message - see you at the gym!\n\n(This is an automated message sent by BodyWorks Gym.)`;

  return `https://wa.me/${member.phone}?text=${encodeURIComponent(message)}`;
}