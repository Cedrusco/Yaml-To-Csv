const yaml = require('js-yaml');
const fs   = require('fs');
const path = require('path');

//only works with non meta/api files so far

  const filenameArr = fs.readdirSync("C:/Users/SamerSaleh/Desktop/products");

    let filteredFiles = []
    for(const file of filenameArr){
    if(file.includes("api")==false && path.extname(file)==".yml" && file.includes("meta")==false){
    filteredFiles.push(file)
    }
    }

    let docArr = []
    for(const file of filteredFiles){
    docArr.push(yaml.load(fs.readFileSync(`C:/Users/SamerSaleh/Desktop/products/${file}`,'utf8')))
    }
    //console.log(docArr)

    let records = []
    for(const file of docArr){
    records.push(generateObj(file))
    }
    console.log(records)

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: 'file.csv',
    header: [
        {id: 'name', title: 'Name'},
        {id: 'title', title: 'Title'},
        {id: 'version', title: 'Version'},
        {id: 'contactInfo', title: 'Contact Info'},
        {id: 'apis', title: 'Apis'}
    ]
});

csvWriter.writeRecords(records)
    .then(() => {
        console.log('...Done');
    });

function generateObj(filename){
    obj = {};
    obj.name = extractName(filename);
    obj.title = extractTitle(filename);
    obj.version = extractVersion(filename);
    obj.contactInfo = extractContactInfo(filename);
    obj.apis = extractApis(filename);

    return obj
}

function extractName(filename){
    if(filename.info.name){
            return filename.info.name
        }else{
            return ""
        }
}
function extractVersion(filename){
    if(filename.info.version){
            return filename.info.version
        }else{
            return ""
        }
}
function extractTitle(filename){
    if(filename.info.title){
            return filename.info.title
        }else{
            return ""
        }
}
function extractContactInfo(filename){
    if(filename.info.contact){
        return filename.info.contact.email
    }else{
        return ""
    }
}

function extractApis(filename){
    const apis = filename.apis
    result= []
    for(const api in apis){
        result.push(removeExtension(filename.apis[api]['$ref']));
    }
    return result.join(', ')
}

function removeExtension(filename) {
    return path.parse(filename.substring(0, filename.lastIndexOf('.'))).name || filename;
}

