const mongoose = require("mongoose");

var defaultPicture = "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";

const korisnikSchema = new mongoose.Schema({

    ime: {
        type: String,
        required: false
    },
    prezime: {
        type: String,
        required: false
    },
    opis: {
        type: String,
        required: false
    },
    coverImage: {
        type: Buffer,
        required: true,
        default: new Buffer.from(defaultPicture, "base64")
    },
    coverImageType: {
        type: String,
        required: true,
        default: "image/png"
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
    /* userName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    } */
});

korisnikSchema.virtual("coverImagePath").get(function(){  //kad zovemo coverImagePath, ona ce zvati ovu get metodu
    if (this.coverImage != null && this.coverImageType != null){ //nije arow fja, da bismo mogli da koristimo this, koji povezuje book
        return `data:${this.coverImageType};charset=utf-8;base64,
       ${this.coverImage.toString("base64")}`;  
    }
});


module.exports = mongoose.model("Korisnik", korisnikSchema);