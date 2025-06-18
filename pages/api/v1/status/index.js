function status(req, res) {
  res.status(200).json({
    chave: "one piece é o melhor anime do mundo!",
  });
}

export default status;
