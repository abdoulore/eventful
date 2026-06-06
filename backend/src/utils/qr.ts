import QRCode from 'qrcode';

export const generateQRCode = async (data: string): Promise<string> => {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 300,
  });
};