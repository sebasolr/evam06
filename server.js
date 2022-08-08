const express = require('express')
const axios = require('axios')
const uuid = require('uuid')
const fs = require('fs').promises
const router = express.Router()
//const bodyParser =require('body-parser')

const app = express()
app.use(express.static('public'))

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

function getForm(req) {
  return new Promise((res, rej) => {
    let str = ''
    req.on('data', function (chunk) {
      str += chunk
    })
    req.on('end', function () {
      //console.log('str', str);
      const obj = JSON.parse(str)
      res(obj)
    })
  })
}
// _____________________________________________________________________________
const crearRoommates = async function (nuevoRoommates) {
  let archivo_db = await fs.readFile('db.json', 'utf8')// 1. Leemos el contenido del archivo 'db.json'

  archivo_db = JSON.parse(archivo_db)// 2. Transformamos su contenido (string) a un objeto de JS
  archivo_db.roommates.push(nuevoRoommates)// 3. Le agregamos el nuevo usuario al array 'users
  archivo_db = JSON.stringify(archivo_db)// 4. Volvemos a transformar el contenido a String
  await fs.writeFile('db.json', archivo_db, 'utf8') // 5. Sobreescribimos el contenido del archivo 'db.json'
}
const mostrarRoommetes = async function () {
  // 1. Leemos el contenido del archivo 'db.json'
  let archivo_db = await fs.readFile('db.json', 'utf8')
  // 2. Transformamos su contenido (string) a un objeto de JS
  archivo_db = JSON.parse(archivo_db)
  // 3. Retornar la propiedad 'users' del archivo leído
  //console.log(archivo_db)
  return archivo_db.roommates
}
// ___________________________________________________________________________
const crearGastos = async function (nuevoGasto,roommates,monto,debe) {
  let archivo_db = await fs.readFile('db.json', 'utf8')// 1. Leemos el contenido del archivo 'db.json'

  archivo_db = JSON.parse(archivo_db)// 2. Transformamos su contenido (string) a un objeto de JS
  archivo_db.roommates.map(function(dato){if(dato.nombre==roommates){dato.recibe += monto}})
  archivo_db.roommates.map(function(dato){if(dato.nombre){dato.debe += debe}})
  archivo_db.gastos.push(nuevoGasto)// 3. Le agregamos el nuevo usuario al array 'users
  archivo_db = JSON.stringify(archivo_db)// 4. Volvemos a transformar el contenido a String
  await fs.writeFile('db.json', archivo_db, 'utf8') // 5. Sobreescribimos el contenido del archivo 'db.json'
}
const mostrarHistorialGastos = async function () {
  // 1. Leemos el contenido del archivo 'db.json'
  let archivo_db = await fs.readFile('db.json', 'utf8')
  // 2. Transformamos su contenido (string) a un objeto de JS
  archivo_db = JSON.parse(archivo_db)
  // 3. Retornar la propiedad 'users' del archivo leído
  //console.log(archivo_db)
  return archivo_db.gastos
}
//const ChangeRecibe = async function (nameRoomie,valorFinal){


app.post('/roommates', async (req, res) => {
  const resp = await axios.get('https://randomuser.me/api')
  const datos = resp.data
  //console.log(resp.data) 
  const nombre = `${datos.results[0].name.first} ${datos.results[0].name.last}`

  //obtener id
  const id_unico = uuid.v4()

  const nuevoRoommates = {
    id: id_unico,
    nombre: nombre,
    debe: 0,
    recibe: 0
  }

  await crearRoommates(nuevoRoommates)
  

  res.json({})
})

app.get('/roommates', async (req, res) => {
  let roommates = await mostrarRoommetes()
  res.json({ roommates })
})
// ________________________________________________________________
app.post('/gastos', async (req, res) => {
  //obtener datos  
  // 1. Recuperamos datos del formulario
  const gasto = await getForm(req)
  // 2. recuperar los datos del formulario
  const roommates = gasto.roommates
  const descripcion = gasto.descripcion
  const monto = gasto.monto
  //obtener id
  const id_gasto = uuid.v4()

  const nuevoGasto = {
    id: id_gasto,
    roommates: roommates,
    descripcion: descripcion,
    monto: monto
  } 
  let archivo_db = await fs.readFile('db.json', 'utf8')// 1. Leemos el contenido del archivo 'db.json'
  archivo_db = JSON.parse(archivo_db)// 2. Transformamos su contenido (string) a un objeto de JS
  const holi = function (){
    let x= 0;
    for(let i=0;i<=100;i++){
    if(archivo_db.roommates[i] === undefined){
      return x
    }else{x+=1}
  }}
  let debe = monto/holi()
  
  await crearGastos(nuevoGasto,roommates,monto,debe)
   
  //se debe traer a base, tranformar a objeto ,bscar posicion,modificarlar,se vuelve a texto,se sobre escribe el archivo


  
  res.json({})
})

app.get('/gastos', async (req, res) => {
  let gastos = await mostrarHistorialGastos()
  res.json({ gastos })
})
async function eliminarUsuario(id){
  let archivo_db = await fs.readFile('db.json','utf-8') 
  archivo_db = JSON.parse(archivo_db)
  archivo_db.gastos.splice(id,1)
  archivo_db = JSON.stringify(archivo_db)
  await fs.writeFile('db.json', archivo_db, 'utf8')

}
/* async function modificarHistorial (nombre, descripcion, monto){
  let archivo_db = await fs.readFile('db.json','utf-8') 
  archivo_db = JSON.parse(archivo_db)
  archivo_db.gastos.map(function(dato){if(dato.nombre==nombre){dato.monto = monto, dato.descripcion = descripcion}})
  archivo_db = JSON.stringify(archivo_db)
  await fs.writeFile('db.json', archivo_db, 'utf8')
} */
app.put('/gastos',async (req,res) =>{

  const gastosEditados = await getForm(req)
  const nombreEditado = gastosEditados.roommates;
  const descripcionEditado = gastosEditados.descripcion;
  const montoEditado = gastosEditados.monto;
  /* modificarHistorial(nombreEditado,descripcionEditado,montoEditado) */
  console.log(req.query.id, nombreEditado,descripcionEditado,montoEditado);
  res.send('holi')
})
app.delete('/gastos', async (req, res) => {
  
  const eliminado = req.query.id;
  eliminarUsuario(eliminado)
  res.send('holi')
})


 app.get('*', (req, res) => {
     res.send('Página aún no implementada')
 });

app.listen(3000, function () {
  console.log(`Servidor corriendo en http://localhost:${3000}/`)
})
