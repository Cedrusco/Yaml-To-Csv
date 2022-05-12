    const yaml = require('js-yaml');
    const fs   = require('fs');
    const path = require('path');

    //get filenames in a dir
    const filenameArr = fs.readdirSync("C:/Users/SamerSaleh/Desktop/products");

    // filter meta files
    let metaFiles = [];
    for(const file of filenameArr){
        if(file.includes(".api")==false && path.extname(file)==".yml" && file.includes(".meta")==true){
                metaFiles.push(file)
        }
    }

    //filter non meta/api files
    let filteredFiles = []
    for(const file of filenameArr){
        if(file.includes(".api")==false && path.extname(file)==".yml" && file.includes(".meta")==false){
            filteredFiles.push(file)
        }
    }

    //load meta files
    let docMetaArr = []
    for(const file of metaFiles){
        docMetaArr.push(yaml.load(fs.readFileSync(`C:/Users/SamerSaleh/Desktop/products/${file}`,'utf8')))
    }

    //load non meta/api files
    let docArr = []
    for(const file of filteredFiles){
        docArr.push(yaml.load(fs.readFileSync(`C:/Users/SamerSaleh/Desktop/products/${file}`,'utf8')))
    }

    //Add state to non-meta file
    for(let file of docArr){
        for(let metafile of docMetaArr){
            if (metafile.name === file.info.name && metafile.version === file.info.version){
                file.state = metafile.state
            }
        }
    }

    //create JSON versions
    let records = []
    for(const file of docArr){
        records.push(generateObj(file))
    }

    //console.log(records)

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
            console.log('...Done');
        });

    //helper functions
    function generateObj(filename, metaFile){
        obj = {};
        obj.name = extractName(filename);
        obj.title = extractTitle(filename);
        obj.version = extractVersion(filename);
        obj.contactInfo = extractContactInfo(filename);
        obj.apis = extractApis(filename);
        obj.state = extractState(filename)

        return obj
    }

    function extractState(filename){
        if(filename.state){
            return filename.state
        }else{
            return ""
        }
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

