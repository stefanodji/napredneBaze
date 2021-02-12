const express = require("express");
const router = express.Router();
const Korisnik = require("../models/korisnikModel");
const Oglas = require("../models/oglasModel");

const imageMimeTypes = ["image/jpeg","image/png", "image/gif"];


//Svi korisnici
router.get("/", async (req, res) => { //localhost:3000/korisnici/
    try {
        const korisnici = await Korisnik.find({});//Saljemo prazan objekat, koji znaci da nemamo uslova
        res.render("korisnici/index", {
            korisnici: korisnici//,
            //searchOptions: req.query //ova dva saljemo nazad
        });
    } catch {
        res.redirect("/");
    }
})



//Novi korisnik -> display the form
router.get("/new", (req, res) => {

    res.render("korisnici/new",{ korisnik: new Korisnik() });
})

//Novi korisnik ce se cuvati u bazi tako sto post metodom posaljemo njegove podatke
router.post("/new", async (req, res) => {
    const korisnik = new Korisnik({
        ime: req.body.ime,
        prezime: req.body.prezime,
        opis: req.body.opis
    })
    saveCover(korisnik, req.body.profilnaSlika);
    if(req.body.profilnaSlika == null || req.body.profilnaSlika == ""){
        console.log("Defoltna slika se stavlja");
    }
    console.log(korisnik);
    try{
        const newKorisnik = await korisnik.save();
        res.redirect(`/korisnici/${newKorisnik.id}`)
        //res.redirect("korisniks");
    }
    catch (err){
        console.log(err);
        res.render("korisnici/new", {
            korisnik: korisnik,
            //locals
            errorMessage: "Error creating korisnik"
        })
    }
})


//Prikaz korisnickog profila sa njegovim id-jem
router.get("/:id", async (req, res) => {
    try {
        const korisnik = await Korisnik.findById(req.params.id);
        const oglasi = await Oglas.find({ korisnikId: korisnik.id }).populate("korisnikId").sort({createdAt: "desc"}).limit(10).exec();
        res.render("korisnici/show", {
            korisnik: korisnik,
            oglasi: oglasi
        });
    } catch (err){
        console.log(err);
        res.redirect(`/korisnici/${korisnik.id}`);
    }
    
})


//Prikaz forme za editovanje odredjenog korisnika
router.get("/:id/edit", async (req, res) => {
    try {
        const korisnik = await Korisnik.findById(req.params.id);
        res.render("korisnici/edit", {korisnik: korisnik});
    } catch {
        res.redirect("/korisnici");
    }
})


//Update korisnik
router.put("/:id", async (req, res) => {  //Ne moramo da brinemo za /edit, jer nam PUT kaze da updatujemo :)
    let korisnik;
    try{
        korisnik = await Korisnik.findById(req.params.id);
        korisnik.ime = req.body.ime;
        korisnik.prezime = req.body.prezime;
        korisnik.opis = req.body.opis;
        if(req.body.profilnaSlika != null && req.body.profilnaSlika != ""){
            saveCover(korisnik, req.body.profilnaSlika);
        }
        await korisnik.save();
        res.redirect(`/korisnici/${korisnik.id}`); //Kada stavimo crticu ispred, idemo od roota. Da ne stavimo bilo bi authors/autors -> znaci bilo bi relativna putanja
    }
    catch{
        if(author == null){ //Ako ne bude pronadjen u bazi
            res.redirect("/");
        }
        else{
            res.render("korisnici/edit", {
                author: author,
                //locals
                errorMessage: "Error updating Author"
            })
        }
    }
})

//Brisanje odredjenog korisnika
router.delete("/:id", async (req, res) => {  
    
    let korisnik;
    let oglasi;
    try{
        korisnik = await Korisnik.findById(req.params.id);
        oglasi = await Oglas.find({korisnikId: korisnik.id});
        oglasi.forEach(async function (oglas){
            console.log("Ovo je grad oglasa: " + oglas.nazivGrada);
            await oglas.remove();
        })
        await korisnik.remove();
        res.redirect("/korisnici"); //Kada stavimo crticu ispred, idemo od roota. Da ne stavimo bilo bi korisnici/autors -> znaci bilo bi relativna putanja
    }
    catch{
        if(korisnik == null){ //Ako ne bude pronadjen u bazi
            res.redirect("/");
        }
        else{
            res.redirect(`/korisnici/${korisnik.id}`);
        }
    }
})


function saveCover(korisnik, coverEncoded){ //coverEncoded je string
    if( coverEncoded == null || coverEncoded == "") return;
    const cover = JSON.parse(coverEncoded);
    if(cover != null && imageMimeTypes.includes(cover.type)){
        /* console.log("cover data\n" + cover.data);
        console.log("cover image type\n" + cover.type); */
        korisnik.coverImage = new Buffer.from(cover.data, "base64");//prvi param je data, a drugi je kako zelimo da ga konvertujemo od
        korisnik.coverImageType = cover.type;
    }
}



module.exports = router;