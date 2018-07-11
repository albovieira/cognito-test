const profileGet = async (req, res) => {
  try {
    return res.status(200).json({
      ...req.user
    });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: 'Not Found' });
  }
};

export default profileGet;
