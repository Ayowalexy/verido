const fs = require('fs')

const data = fs.readFileSync('Books.txt', {encoding: "utf8"})

let verse_number;
let verse = '';
let num;

let verArr = [];
const number = [1, 2, 3, 4, 5, 6];
let GOD_SAID;
let before_verse;
let after_verse;

if(data.indexOf('“')){
    before_verse = data.slice(1, data.indexOf('“'))
    GOD_SAID = data.slice(data.indexOf('“'), (data.indexOf('”') + 1))
    after_verse = data.slice((data.indexOf('”') + 1))

}

// console.log(`before_verse: ${before_verse} \n GOD_SAID: ${GOD_SAID} \n after_vers: ${after_verse}`)

    for(let i = 0; i < data.length; i++){
        verse_number = Number(data[i])
        if(number.includes(verse_number)){
            console.log(data[i])
            num = data[i]
        } else {
            verse = verse.concat(data[i])
        }
}


// fs.writeFileSync('bible.txt', `verse_number: ${num}, verse: '${verse}'`, {encoding: 'utf8'})

