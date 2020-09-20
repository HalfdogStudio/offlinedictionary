// ==UserScript==
// @name     offline dictionary
// @version  1
// @include *
// @grant    GM.getResourceUrl
// @require https://raw.githubusercontent.com/nodeca/pako/master/dist/pako.min.js
// @require https://raw.githubusercontent.com/HalfdogStudio/offlinedictionary/master/dictzip.js
// @require https://raw.githubusercontent.com/HalfdogStudio/offlinedictionary/master/stardict.js
// @resource dict https://raw.githubusercontent.com/yanyingwang/goldendict/master/dictdd/stardict-langdao-ec-gb-2.4.2/langdao-ec-gb.dict.dz
// @resource idx https://raw.githubusercontent.com/yanyingwang/goldendict/master/dictdd/stardict-langdao-ec-gb-2.4.2/langdao-ec-gb.idx
// @resource ifo https://raw.githubusercontent.com/yanyingwang/goldendict/master/dictdd/stardict-langdao-ec-gb-2.4.2/langdao-ec-gb.ifo
// ==/UserScript==


console.log("----offline dictionary start------");

function handleReject(e) {
    console.log(e)
}

async function resourceToFile(resource, fileName){
    let url = await GM.getResourceUrl(resource).catch(handleReject);
    console.log(url)
    let theBlob = await fetch(url).then(r => r.blob()).catch(handleReject)
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
}

async function loadDict() {
    return Promise.all([
        resourceToFile('dict', "dict.dict.dz"),
        resourceToFile('idx', "dict.idx"),
        resourceToFile('ifo', "dict.ifo"),
    ]).then((files) => {
        // files.forEach(f => {
        //     f.text().then(t => {
        //     })
        // })
        // console.log("resources: ", files)
        dict = new StarDict()
        window.__DICT__ = dict
        return dict.load(files)
    })
};

loadDict().then(_ => {
    // console.log(window.__DICT__)
    return window.__DICT__.index()
                 .then(index => {
                     console.log('--------------')
                     console.log(index)
                     console.log('--------------')
                     window.__INDEX__ = index.reduce((map, obj) => {
                         map[obj.term] = obj.dictpos;
                         return map
                     }, {})
                     console.log('ready');
                 })
                 .catch(handleReject)
}).then(_ => {
    pos = window.__INDEX__['hello']
    return window.__DICT__.entry(pos).then(entry => {
        console.log(entry)
    })
})
.catch(handleReject)

async function translate(e) {
    //console.log("translate start");
    var selectObj = document.getSelection();
    if (selectObj.anchorNode && selectObj.anchorNode.nodeType == 3) {
        var word = selectObj.toString();
        if (word == "") {
            return;
        }
        // linebreak wordwrap, optimize for pdf.js
        word = word.replace('-\n','');
        // multiline selection, optimize for pdf.js
        word = word.replace('\n', ' ');
    }
    pos = window.__INDEX__[word]
    console.log("search: ", word)
    let entry = await window.__DICT__.entry(pos).then(entry=> {
        // console.log(entry)
        return entry
    }).catch(handleReject)
    alert(entry[0].content)
}

window.document.body.addEventListener("mouseup", translate, false);


console.log("----offline dictionary end----");
