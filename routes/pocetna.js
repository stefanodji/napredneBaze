const express = require("express");
const router = express.Router();
const Grad = require("../models/gradModel");
const Oglas = require("../models/oglasModel");
const Korisnik = require("../models/korisnikModel");
const { remove } = require("../models/oglasModel");
const DeloviGrada = require("../models/deloviGradaModel");



router.get("/", async (req, res) => {


  const Zajecar = await Grad.find({naziv: "Zajecar"});
  console.log("Ovo mu je id: " + Zajecar[0].id);

  const deloviGrada = [{
    naziv: "Naselje plaza",
    koordinate: {
      lat: 43.907411,
      lng: 22.270499
    },
    gradId: Zajecar[0].id
  }
]



/* deloviGrada.forEach(deoGrada => {
  let deo = new DeloviGrada(deoGrada);
  deo.save();
  console.log(deo);
}); */


    const arrayMarkera = [];
    var arrayPostojecihGradova = [];
    var pomoc = [];

    const oglasi = await Oglas.find({});
    const gradoviDb = await Grad.find({});

    var postojiGrad = false;

    oglasi.forEach(oglas => { //Ubacamo sve gradove koji postoje u oglasima, bice duplikata
      if(oglas.svrhaOglasa != "tcns")
        arrayMarkera.push(oglas.koordinateStana);
      pomoc.forEach(nazivGrada => { //Pomocni niz koji sluzi da bismo videli da li smo vec ubacili taj grad
        if(nazivGrada === oglas.nazivGrada){
          postojiGrad = true;
        }
      });
      if(postojiGrad === false){ //Ako nismo, ubacamo ga ovde :)
        pomoc.push(oglas.nazivGrada);
          gradoviDb.forEach(grad => {
            if(grad.naziv === oglas.nazivGrada){
              arrayPostojecihGradova.push(grad);
            }
          });
      } else postojiGrad = false;
    });


    res.render("pocetna/pocetnaIzgled", {
                                            markeri: JSON.stringify(arrayMarkera),
                                            gradoviDb: JSON.stringify(arrayPostojecihGradova)
                                        });
})

module.exports = router;