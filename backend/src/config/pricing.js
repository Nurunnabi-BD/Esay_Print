module.exports = {
  // Pricing in BDT
  bwPrice: parseInt(process.env.PRICE_BW_PER_PAGE, 10) || 3,
  colorPrice: parseInt(process.env.PRICE_COLOR_PER_PAGE, 10) || 5,
};
