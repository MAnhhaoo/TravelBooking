const p = require('./src/configs/database');
(async ()=>{
  try{
    const users = await p.users.findMany();
    console.log('OK', users.length);
  }catch(e){
    console.error('ERR', e && e.message || e);
  }finally{
    try{ await p.$disconnect(); }catch(_){}
  }
})();