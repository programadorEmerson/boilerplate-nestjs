const generateCodeConfirmation = (): number => {
  const code = Math.floor(100000 + Math.random() * 999999);
  const codePad = String(code).padStart(6, '7').substring(0, 6);
  return Number(codePad);
};

export default generateCodeConfirmation;
