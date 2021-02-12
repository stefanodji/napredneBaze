const express = require("express");
const { query } = require("express");
const router = express.Router();

const Oglas = require("../models/oglasModel");
const Korisnik = require("../models/korisnikModel");
const Grad = require("../models/gradModel");
const DeloviGrada = require("../models/deloviGradaModel");
const { render } = require("ejs");

const imageMimeTypes = ["image/jpeg","image/png", "image/gif"];


//Za sve oglase na sajtu
router.get("/", async (req, res) => { //localhost:3000/oglasi/
    var arrayOfCoverImagePath = [];
    var arrayOfCoverImagePathKorisnici = [];

    try {
        const oglasi = await Oglas.find({}).populate("korisnikId");
        oglasi.forEach(oglas => {
            if(oglas.slike.length === 0){
                //console.log(oglas.cena + " je " + oglas.slike.length);
                arrayOfCoverImagePath.push(oglas.coverImagePathDefault);

            } else {
                //console.log(oglas.cena + " je " + oglas.slike.length);
                arrayOfCoverImagePath.push(oglas.coverImagePath[0]);
            }

            arrayOfCoverImagePathKorisnici.push(oglas.korisnikId.coverImagePath);
        });
        
        res.render("oglasi/index",{
            oglasi: oglasi,
            arrayOfCoverImagePath: arrayOfCoverImagePath,
            arrayOfCoverImagePathKorisnici: arrayOfCoverImagePathKorisnici
        });
    } catch (error) {
        console.log(error);
        res.redirect("/");
    }
})




//Za oglase odredjenog grada
router.post("/grad", async (req, res) => {
    let searchOptions = { nazivGrada: req.body.chooseCity};
    //console.log(req.body.chooseCity);
    var arrayOfCoverImagePath = [];
    var arrayOfCoverImagePathKorisnici = [];

    try {
        const oglasi = await Oglas.find(searchOptions).populate("korisnikId");
        oglasi.forEach(oglas => {
            if(oglas.slike.length === 0){
                //console.log(oglas.cena + " je " + oglas.slike.length);
                arrayOfCoverImagePath.push(oglas.coverImagePathDefault);

            } else {
                //console.log(oglas.cena + " je " + oglas.slike.length);
                arrayOfCoverImagePath.push(oglas.coverImagePath[0]);
            }
            arrayOfCoverImagePathKorisnici.push(oglas.korisnikId.coverImagePath);
        });
        //console.log(arrayOfCoverImagePath.length);
        res.render("oglasi/index",{
            oglasi: oglasi,
            arrayOfCoverImagePath: arrayOfCoverImagePath,
            arrayOfCoverImagePathKorisnici: arrayOfCoverImagePathKorisnici
        });
    } catch (error) {
        res.redirect("/");
    }
})



//Za oglase u radiusu
router.post("/radiusOglasi", async (req, res) => {

    //console.log("======================================================================================");
    

    const koordinateStanova = JSON.parse(req.body.saljiNiz);
    var arrayOglasa = [];
    var arrayOfCoverImagePath = [];
    var arrayOfCoverImagePathKorisnici = [];
    

    for(var x=0;x<koordinateStanova.length;x++){
        let nesto = await Oglas.find({koordinateStana: koordinateStanova[x]}).populate("korisnikId");
        arrayOglasa.push(nesto[0]);//nesto[0]
    }
    
    arrayOglasa.forEach(oglas => {
        if(oglas.slike.length === 0){
            //console.log(oglas.cena + " je " + oglas.slike.length);
            arrayOfCoverImagePath.push(oglas.coverImagePathDefault);

        } else {
            //console.log(oglas.cena + " je " + oglas.slike.length);
            arrayOfCoverImagePath.push(oglas.coverImagePath[0]);
        }
        arrayOfCoverImagePathKorisnici.push(oglas.korisnikId.coverImagePath);
    });

    res.render("oglasi/index",{
        oglasi: arrayOglasa,
        arrayOfCoverImagePath: arrayOfCoverImagePath,
        arrayOfCoverImagePathKorisnici: arrayOfCoverImagePathKorisnici
    })
            
})


router.post("/new", async (req, res) =>{

    const gradoviDb = await Grad.find({}).sort({naziv: "desc"}).exec();
    const nizDelovaGrada = await DeloviGrada.find({}).sort({naziv: "desc"}).exec();

    res.render("oglasi/new", { oglas: new Oglas(), 
                                svrha: req.body.svrhaOglasa,
                                korisnikId: req.body.korId,
                                ponudjeniGradovi: JSON.stringify(gradoviDb),
                                deloviGrada: JSON.stringify(nizDelovaGrada)
                                    });

});



router.post("/new/dodaoOglas", async (req, res) =>{
   
    const oglas = makeOglasObject(req);
    //console.log(oglas);
    if(req.body.ubaciSliku == null || req.body.ubaciSliku == ""){
        console.log("Slike nema");
    }
    else
    
    saveCover(oglas, req.body.ubaciSliku);

    //console.log("Ovo je prva slika: " + oglas.slike[0]);
    //console.log("Ovo je druga slika: " + oglas.slike[1]);

    try {
        
        await oglas.save();
        //console.log(oglas);
        
        res.redirect(`/korisnici/${oglas.korisnikId}`);
    } catch (err) {
        console.log(oglas);
        console.log("Nece da cuva oglas\n" + err)
        //renderNewPage(res, oglas, true);
        //res.redirect("/oglasi/new");
    }




});

router.get("/:id", async (req, res) => { //localhost:3000/oglasi/
    try {
        const oglas = await Oglas.findById(req.params.id);
        const korisnik = await Korisnik.findById(oglas.korisnikId)
        //const nizGradova = await Grad.find({naziv: oglas.nazivGrada}).exec();
        const nizOpstina = await DeloviGrada.find({naziv: oglas.deoGradaOpstina}).exec();

        res.render("oglasi/show",{
            oglas: oglas,
            korisnik: korisnik,
            grad: nizOpstina[0]
        });
    } catch (error) {
        console.log("Ovo je greska greskca:\n" + error);
        res.redirect("/oglasi");
    }
})

router.get("/:id/edit", async (req, res) => {
    try {
        const oglas = await Oglas.findById(req.params.id);
        //const korisnik = await Korisnik.findById(oglas.korisnikId)
        const nizGradova = await Grad.find({}).sort({naziv: "desc"}).exec();
        const deloviGrada = await DeloviGrada.find({}).sort({naziv: "desc"}).exec();

        var gradZaId = await Grad.findOne({naziv: oglas.nazivGrada}); //grad oglasa, s tim i ref na opsinaIliDeoGada
        gradZaId = gradZaId.id;

        var pocetneKoordZaDeoGrada = await DeloviGrada.findOne({gradId: gradZaId, naziv: oglas.deoGradaOpstina})
        console.log(pocetneKoordZaDeoGrada.naziv);
        

        res.render("oglasi/edit",{
            oglas: oglas,
            //korisnik: korisnik,
            nizGradova: JSON.stringify(nizGradova),
            deloviGrada: JSON.stringify(deloviGrada),
            gradZaId: gradZaId,
            pocetneKoordZaDeoGrada: JSON.stringify(pocetneKoordZaDeoGrada.koordinate)
        });
    } catch (error) {
        console.log(error);
        res.redirect("/oglasi");
    }
})

router.put("/:id", async (req, res) => {
    
    let oglas;

    try {
        oglas = await Oglas.findById(req.params.id);
        console.log("Ovaj oglas menjamo: " + oglas);
        //console.log("Ovo je slika: " + req.body.ubaciSliku);

        editOglasObject(req, oglas);
        if(req.body.ubaciSliku != null && req.body.ubaciSliku != ""){
            saveCover(oglas, req.body.ubaciSliku);
        }
        //console.log("Sada izgleda: " + oglas);
        const nesto = await oglas.save();
        //console.log("Posle save: " + nesto);
        res.redirect(`/korisnici/${oglas.korisnikId}`);

    } catch (err){
        if(oglas != null){ //ako smo uspeli da je dobijemo iz baze ali smo imali problem sa cuvanjem oglasa
            console.log("ima li smo problema sa cuvanjem oglasa");
            const oglas = await Oglas.findById(req.params.id);
            const korisnik = await Korisnik.findById(oglas.korisnikId)
            const nizGradova = await Grad.find({naziv: oglas.nazivGrada}).exec();

            res.render("oglasi/show",{
                oglas: oglas,
                korisnik: korisnik,
                grad: nizGradova[0]
            });
        }else{
            console.log(err);
            redirect("/");
        }
    }
})

router.delete("/:id", async (req, res) => {
    let oglas;
    try{
        oglas = await Oglas.findById(req.params.id);
        let idKoriniska = oglas.korisnikId;
        await oglas.remove();
        res.redirect(`/korisnici/${idKoriniska}`); //Kada stavimo crticu ispred, idemo od roota. Da ne stavimo bilo bi authors/autors -> znaci bilo bi relativna putanja
    }
    catch{
        if(oglas == null){ //Ako ne bude pronadjen u bazi
            res.redirect("/");
        }
        else{
            res.redirect(`/oglasi/${oglas.id}`);
        }
    }
})



function trueOrFalse(vrednost){
    if(vrednost === "on"){
        return true;
    } else {
        return false;
    }
}

function makeOglasObject(req){
    return new Oglas({
        tipObjekta: req.body.tipObjekta,
        useljivOd: req.body.useljivOd, //new treba new Date
        cena: req.body.cena,
        nacinGrejanja: req.body.nacinGrejanja,
        cimerOrCimerka: req.body.cimerIliCimerka,
        nazivGrada: req.body.nazivGrada,
        koordinateStana: JSON.parse(req.body.saljiKoordinateMarkera),
        deoGradaOpstina: req.body.deoGrada,
        adresa: req.body.adresa,
        korisnikId: req.body.korisnikId,
        svrhaOglasa: req.body.svrhaOglasa,
        vesMasina: trueOrFalse(req.body.vesMasina),
        zamrzivac: trueOrFalse(req.body.zamrzivac),
        frizider: trueOrFalse(req.body.frizider),
        friziderSaZamrzivacem: trueOrFalse(req.body.friziderSaZamrzivacem),
        sporet: trueOrFalse(req.body.sporet),
        mikrotalasna: trueOrFalse(req.body.mikrotalasna),
        kada: trueOrFalse(req.body.kada),
        tusKabina: trueOrFalse(req.body.tusKabina),
        klima: trueOrFalse(req.body.klima),
        tv: trueOrFalse(req.body.tv),
        sank: trueOrFalse(req.body.sank),
        terasa: trueOrFalse(req.body.terasa),
        usisivac: trueOrFalse(req.body.usisivac),
        aspirator: trueOrFalse(req.body.aspirator),
        mikser: trueOrFalse(req.body.mikser),
        escajg: trueOrFalse(req.body.escajg),
        posudje: trueOrFalse(req.body.posudje)

    });
}

function editOglasObject(req, objekat){
   
        objekat.tipObjekta= req.body.tipObjekta;
        objekat.useljivOd= req.body.useljivOd; //new treba new Date
        objekat.cena= req.body.cena;
        objekat.nacinGrejanja= req.body.nacinGrejanja;
        objekat.cimerOrCimerka= req.body.cimerIliCimerka;
        objekat.nazivGrada= req.body.nazivGrada;
        objekat.koordinateStana= JSON.parse(req.body.saljiKoordinateMarkera);
        objekat.deoGradaOpstina= req.body.deoGrada;
        objekat.adresa= req.body.adresa;
        objekat.korisnikId= req.body.korisnikId;
        objekat.svrhaOglasa= req.body.svrhaOglasa;
        objekat.vesMasina= trueOrFalse(req.body.vesMasina);
        objekat.zamrzivac= trueOrFalse(req.body.zamrzivac);
        objekat.frizider= trueOrFalse(req.body.frizider);
        objekat.friziderSaZamrzivacem= trueOrFalse(req.body.friziderSaZamrzivacem);
        objekat.sporet= trueOrFalse(req.body.sporet);
        objekat.mikrotalasna= trueOrFalse(req.body.mikrotalasna);
        objekat.kada= trueOrFalse(req.body.kada);
        objekat.tusKabina= trueOrFalse(req.body.tusKabina);
        objekat.klima= trueOrFalse(req.body.klima);
        objekat.tv= trueOrFalse(req.body.tv);
        objekat.sank= trueOrFalse(req.body.sank);
        objekat.terasa= trueOrFalse(req.body.terasa);
        objekat.usisivac= trueOrFalse(req.body.usisivac);
        objekat.aspirator= trueOrFalse(req.body.aspirator);
        objekat.mikser= trueOrFalse(req.body.mikser);
        objekat.escajg= trueOrFalse(req.body.escajg);
        objekat.posudje= trueOrFalse(req.body.posudje);

}

function saveCover(oglas, coverEncodedArray){ //coverEncoded je string
    if( coverEncodedArray === null && coverEncodedArray === "") return;

    if(coverEncodedArray[0] === "{"){ //Ako smo poslali samo jednu sliku
        
        var cover = JSON.parse(coverEncodedArray);
        if(cover != null && imageMimeTypes.includes(cover.type)){

            var coverImage = new Buffer.from(cover.data, "base64");//prvi param je data, a drugi je kako zelimo da ga konvertujemo od
            var coverImageType = cover.type;
            //console.log(getFileEncodeDataURL(cover));

            oglas.slike.push({
                coverImage: coverImage,
                coverImageType: coverImageType
            });
        }
    }
    else{ //Vise slika
        coverEncodedArray.forEach( coverEncoded => {
            var cover = JSON.parse(coverEncoded);
            if(cover != null && imageMimeTypes.includes(cover.type)){

                var coverImage = new Buffer.from(cover.data, "base64");//prvi param je data, a drugi je kako zelimo da ga konvertujemo od
                var coverImageType = cover.type;
                //console.log(getFileEncodeDataURL(cover));

                oglas.slike.push({
                    coverImage: coverImage,
                    coverImageType: coverImageType
                });
            }
        });
    }
    
}

module.exports = router;