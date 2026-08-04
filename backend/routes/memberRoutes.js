// UPDATE a member
router.put('/:id', async (req, res) => {
  try {
    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedMember) {
      return res.status(404).json({ error: 'Member not found' });
    }
    await logAction('Edited Member', `${updatedMember.name} (${updatedMember.gymCode})`, req.adminEmail);
    res.json(updatedMember);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});