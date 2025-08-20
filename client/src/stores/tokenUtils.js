// // src/stores/tokenUtils.js
// export const isTokenExpired = (token) => {
//   if (!token) return true;
  
//   try {
//     const payloadBase64 = token.split('.')[1];
//     const decodedPayload = JSON.parse(atob(payloadBase64));
//     const exp = decodedPayload.exp;
    
//     if (!exp) return true; // ไม่มี exp ถือว่าหมดอายุ
//     const now = Math.floor(Date.now() / 1000);
//     return exp < now;  // true = หมดอายุแล้ว
//   } catch (error) {
//     return true; // ถ้า decode ไม่ได้ถือว่าหมดอายุ
//   }
// };

export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const [, payloadBase64] = token.split('.');
    const payload = JSON.parse(atob(payloadBase64));
    const exp = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    return now >= exp;
  } catch (e) {
    return true;
  }
};
