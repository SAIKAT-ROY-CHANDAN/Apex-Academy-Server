const generateOTP = () => {
  const opt = Math.floor(100000 + Math.random() * 900000).toString();

  return opt;
};

export default generateOTP;
