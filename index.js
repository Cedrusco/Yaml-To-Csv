    const yaml = require('js-yaml');
    const fs   = require('fs');
    const path = require('path');

    //Please provide directory here
    let myDir = "C:/Users/SamerSaleh/Desktop/products"

    //get filenames in the dir
    const fileNameArr = fs.readdirSync(myDir);

    // filter meta files
    let metaFiles = [];
    for(const file of fileNameArr){
        if(file.includes(".api")==false && path.extname(file)==".yml" && file.includes(".meta")==true){
                metaFiles.push(file)
        }
    }

    //filter non meta/api files
    let filteredFiles = [];
    for(const file of fileNameArr){
        if(file.includes(".api")==false && path.extname(file)==".yml" && file.includes(".meta")==false){
            filteredFiles.push(file)
        }
    }

    //load meta files
    let docMetaArr = []
    for(const file of metaFiles){
        docMetaArr.push(yaml.load(fs.readFileSync(`${myDir}/${file}`,'utf8')))
    }

    //load non meta/api files
    let docArr = []
    for(const file of filteredFiles){
        docArr.push(yaml.load(fs.readFileSync(`${myDir}/${file}`,'utf8')))
    }

    //Add state from meta-file to non-meta file
    for(let file of docArr){
        for(let metaFile of docMetaArr){
            if (metaFile.name === file.info.name && metaFile.version === file.info.version){
                file.state = metaFile.state
            }
        }
    }

    //create JSON versions
    let records = []
    for(const file of docArr){
        records.push(generateObj(file))
    }

    //create csv file
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
        path: 'file.csv',
        header: [
            {id: 'name', title: 'Name'},
            {id: 'title', title: 'Title'},
            {id: 'version', title: 'Version'},
            {id: 'contactInfo', title: 'Contact Info'},
            {id: 'apis', title: 'Apis'},
            {id: 'state', title: 'State'}
        ]
    });

    //write to csv file
    csvWriter.writeRecords(records)
        .then(() => {
            console.log('...Done, Please Check file.csv for Results');
        });

    //helper functions
    function generateObj(fileName){
        obj = {};
        obj.name = extractName(fileName);
        obj.title = extractTitle(fileName);
        obj.version = extractVersion(fileName);
        obj.contactInfo = extractContactInfo(fileName);
        obj.apis = extractApis(fileName);
        obj.state = extractState(fileName)

        return obj
    }

    function extractState(fileName){
        if(fileName.state){
            return fileName.state
        }else{
            return ""
        }
    }

    function extractName(fileName){
        if(fileName.info.name){
            return fileName.info.name
        }else{
            return ""
        }
    }

    function extractVersion(fileName){
        if(fileName.info.version){
            return fileName.info.version
        }else{
            return ""
        }
    }

    function extractTitle(fileName){
        if(fileName.info.title){
            return fileName.info.title
        }else{
            return ""
        }
    }

    function extractContactInfo(fileName){
        if(fileName.info.contact){
            return fileName.info.contact.email
        }else{
            return ""
        }
    }

    function extractApis(fileName){
        const apis = fileName.apis
        result= []
        for(const api in apis){
            result.push(removeExtension(fileName.apis[api]['$ref']));
        }
        return result.join(', ')
    }

    function removeExtension(fileName) {
        return path.parse(fileName.substring(0, fileName.lastIndexOf('.'))).name || fileName;
    }

