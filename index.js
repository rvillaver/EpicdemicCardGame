var fs = require('fs');
var Mustache = require("Mustache");
var { convertFile }  = require('convert-svg-to-jpeg');
var { execSync } = require('child_process');

var pdfkit = require('pdfkit');

var STEAM_MOD_ID = '2474249248';
var PAGE1_CLOUD = 'http://cloud-3.steamusercontent.com/ugc/1787343637278755342/D46779AA01B5F1F8F3ADC9956C8315A6325EED40/';
var BACK1_CLOUD = 'http://cloud-3.steamusercontent.com/ugc/1787343637278756138/1BE8A94B08A15ED0F733C90C6FF0709B6A5269D1/';
var PAGE2_CLOUD = 'http://cloud-3.steamusercontent.com/ugc/1787343637278771226/292066BB3E972EAFDE826DD08D4891E8AF09649E/';
var BACK2_CLOUD = 'http://cloud-3.steamusercontent.com/ugc/1787343637278772741/C98D123F6A07FCC03E659E01B5129705F8D5A153/';
var PAGE3_CLOUD = 'http://cloud-3.steamusercontent.com/ugc/1787343637278776952/2754588E62B6DA016A52CDB40ECA9F223E9D4A40/';
var BACK3_CLOUD = 'http://cloud-3.steamusercontent.com/ugc/1787343637278778905/A05929E3579D15642196BA561FB71708236C9A06/';

var BACKPAGE_CLOUD = 'http://cloud-3.steamusercontent.com/ugc/1787343568844221586/899CA40D43783415A5323E051C97EF51FAF763A6/';
var HQPAGE_CLOUD = 'http://cloud-3.steamusercontent.com/ugc/1787343568847127993/D19DFC85231CD9B69E402B91F7BB3BE899CF1C4A/';

// var gm = require('google-static-map').set('');
 
// var stream = gm().address('City of Manila').staticMap().done();
var locations = ["Metro Manila",
"Calabarzon",
"Central Luzon",
"Central Visayas",
// "Western Visayas",
// "Cordillera Administrative Region",
"Davao Region",
// "Cagayan Valley",
// "Eastern Visayas",
// "Ilocos Region",
// "Northern Mindanao",
// "Caraga",
"Zamboanga Peninsula",
// "SOCCSKSARGEN",
// "Bicol",
// "MIMAROPA"
];

var cIndex = -1;

// var fn = () => {
//     cIndex++;
//     if(cIndex>=list.length) return;
//     var stream = gm()
//     .zoom(9)
//     .resolution('1024x1024')
//     .address(list[cIndex])
//     .staticMap()
//     .done();
//     stream.pipe(fs.createWriteStream('./cities/'+list[cIndex]+'.png'));
//     fn();
// }
// fn();

var types = {
    '[Recruit]': '<tspan class="cardpink">&#xf2c1;</tspan>',
    '[Test]': '<tspan class="cardblue">&#xf0c3;</tspan>',
    '[Cure]': '<tspan class="cardpurple">&#xf0f1;</tspan>',
    '[Fund]': '<tspan class="cardyellow">&#xf51e;</tspan>',
    '[Quarantine]': '<tspan class="cardbrown">&#xf023;</tspan>',
    '[Build]': '<tspan class="cardcoal">&#xf807;</tspan>',
    '[virus]': '<tspan class="cardred">&#xe074;</tspan>',
    '[inline-Recruit]': '&#xf2c1;',
    '[inline-Test]': '&#xf0c3;',
    '[inline-Cure]': '&#xf0f1;',
    '[inline-Fund]': '&#xf51e;',
    '[inline-Quarantine]': '&#xf023;',
    '[inline-Build]': '&#xf807;',
    '[inline-virus]': '&#xe074;',
    '[inline-money]': '&#xf0d6;',
    '[inline-vaccine]': '&#xf48e;',
    '[inline-positive]': '&#xf0fe;',
    '[inline-negative]': '&#xf146;',
    '[inline-hand]': '&#xf256;',
    '[inline-hq]': '&#xf015;',    
    '[inline-cured]': '&#xf4fc;',
    '[inline-medical]': '&#xf7f2;',
    '[double-mutation]': '<tspan class="cardred">&#xe074;&#xe074;</tspan>',
    '[cost-mutation]': '<tspan class="cardred">&#xf155;&#xe074;</tspan>',
    '[zombie-mutation]': '<tspan class="cardred">&#xf82a;&#xe074;</tspan>',
    '[money]': '<tspan class="cardgreen">&#xf0d6;</tspan>',
    '[vaccine]': '<tspan class="cardgrey">&#xf48e;</tspan>'
};

var descriptions = {
    '[Recruit]': 'Recruit: Take a non-infected card [inline-negative] in front of a city or from the [inline-cured] cured zone and put them in your HQ [inline-hq] &nbsp;&nbsp;&nbsp; as a social (left) or government (right) frontliner.',
    '[Test]': 'Test: Take a non-infected &nbsp;&nbsp;&nbsp; card [inline-negative] in front of a city and put it into your hand [inline-hand].',
    '[Cure]': 'Cure: Discard [inline-money] card from your HQ [inline-hq] to move an infected card [inline-positive] in front of a city or from one of your facilities [inline-medical] to the [inline-cured] cured zone.',
    '[Fund]': 'Fund: Place a card from your hand [inline-hand] face down in front of your HQ [inline-hq] as money [inline-money].',
    '[Quarantine]': 'Quarantine: Move an infected card [inline-positive] in front of a city to your medical facility [inline-medical].',
    '[Build]': 'Build: Put beside your city a facility [inline-medical] from your hand [inline-hand] by discarding the money [inline-money] from your HQ [inline-hq] and card(s) &nbsp;&nbsp;&nbsp;&nbsp;  with matching icons from your hand as required.',
};

var supportActions = {
    '[Recruit]': '[inline-Recruit]',
    '[Test]': '[inline-Test]',
    '[Cure]': '[inline-Cure]',
    '[Fund]': '[inline-Fund]',
    '[Quarantine]': '[inline-Quarantine]',
    '[Build]': '[inline-Build]',
    '[virus]': '[inline-virus]'
};

var color = {
    '[Recruit]': 'pink',
    '[Test]': 'blue',
    '[Cure]': 'purple',
    '[Fund]': 'yellow',
    '[Quarantine]': 'brown',
    '[Build]': 'coal'
};

var socials = ['[Recruit]','[Test]','[Cure]'];
var governance = ['[Fund]','[Quarantine]','[Build]'];

var master = [
    {
        title: '<tspan class="lab1color">TESTING CENTER</tspan>',
        subtitle: 'Viral Test',
        city: 'Metro Manila',
        description: 'A viral test tells you if you have a current infection. Two types of viral tests can be used: nucleic acid amplification tests (NAATs) and antigen tests.',
        cost: '[money]',
        effect: 'Once per turn when you deal a card to a city, you may choose to discard it and draw another card to replace.',
        labcolor: 'lab1color',
        capacity: '&#xf0fe;&#xf0fe;&#xf0fe;',
        capacitytext: 'Hold up to 3 &#xf0fe;',
        leftactiondesc: '',
        rightactiondesc: '',
        socialaction: '',
        socialactioncolor: '',
        governmentaction: '',
        governmentactioncolor: '',
        infection: '',
        count: 4
    },
    {
        title: '<tspan class="lab2color">QUARANTINE FACILITY</tspan>',
        subtitle: 'Isolation and Quarantine',
        city: 'Metro Manila',
        description: 'Isolation separates sick people with a contagious disease from people who are not sick. Quarantine separates and restricts the movement of people who were exposed to a contagious disease to see if they become sick.',
        cost: '[money][money]',
        effect: 'Hold up to 5 &#xf0fe; cards. Cards in quarantine are considered not in the city.',
        labcolor: 'lab2color',
        capacity: '&#xf0fe;&#xf0fe;&#xf0fe;&#xf0fe;&#xf0fe;',
        capacitytext: '',
        leftactiondesc: '',
        rightactiondesc: '',
        socialaction: '',
        socialactioncolor: '',
        governmentaction: '',
        governmentactioncolor: '',
        infection: '',
        count: 3
    },
    {
        title: '<tspan class="lab3color">VACCINE LABORATORY</tspan>',
        subtitle: 'Distribution and Administration',
        city: 'Metro Manila',
        description: 'COVID-19 vaccines are safe and effective. After you’ve been fully vaccinated, you can start to do some things that you had to stop doing because of the pandemic.',
        cost: '[money][money][money]',
        effect: 'You may take the &#xf0f1; Cure action without discarding money &#xf0d6;. You may also use the cure action on [inline-negative] cards in cities.',
        labcolor: 'lab3color',
        capacity: '&#xf0fe;&#xf0fe;&#xf0fe;&#xf0fe;',
        capacitytext: 'Hold up to 4 &#xf0fe;',
        leftactiondesc: '',
        rightactiondesc: '',
        socialaction: '',
        socialactioncolor: '',
        governmentaction: '',
        governmentactioncolor: '',
        infection: '',
        count: 3
    }

];

var shuffle = (array)=>{
	var currentIndex = array.length, temporaryValue, randomIndex ;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}

var cleanUp = (o)=>{
    for(var i in o){
        if(i!='count'){
            for(var j in types){
                o[i] = o[i].split(j).join(types[j]);
            }
        }
    }
    return o;
}

var cards = [];

var cityCtr = -1;
for(var i=0;i<master.length;i++){
    for(var j=0;j<socials.length;j++){
        for(var k=0;k<governance.length;k++){
            for(var l=0;l<master[i].count;l++){
                var c = {...master[i]};
                c.cost = c.cost+socials[j]+governance[k];
                c.socialaction = socials[j];
                c.socialsupportaction = supportActions[socials[j]];
                c.socialactioncolor = color[socials[j]];
                c.governmentaction = governance[k];
                c.governmentsupportaction = supportActions[governance[k]];
                c.governmentactioncolor = color[governance[k]];

                c.leftactiondesc = descriptions[c.socialaction];
                c.rightactiondesc = descriptions[c.governmentaction];

                cityCtr++;
                if(cityCtr>=locations.length){
                    cityCtr = 0;
                }
                c.city = locations[cityCtr];
                cards.push(c);
            }
        }
    }
}

cards = shuffle(cards);
var virusTotals = {
    zombie: 0,
    cost: 0,
    double: 0,
    normal: 0
}
for(var i=0;i<cards.length;i++){
    if(i%9==0){
        cards[i].infection = '[zombie-mutation]';
        virusTotals.zombie++;
    }else if(i%7==0){
        cards[i].infection = '[cost-mutation]';
        virusTotals.cost++;
    }else if(i%5==0){
        cards[i].infection = '[double-mutation]';
        virusTotals.double++;
    }else if(i%3==0){
        cards[i].infection = '[virus]';
        virusTotals.normal++;
    }
}

console.log('Infection Totals', virusTotals);
console.log('Card Total', cards.length);
var vt = 0;
for(var i in virusTotals){
    vt+=virusTotals[i];
}
console.log('Infection Ratio', Math.round((vt/cards.length)*100));

function generateCards(){
    var template = fs.readFileSync('./PandemicTemplate.svg').toString();

    console.log('Cards Length', cards.length);
    var fn = ()=>{
        cIndex++;
        fs.writeFileSync('./temp.svg',Mustache.render(template,cleanUp(cards[cIndex])));
        if(cIndex>=cards.length){
            console.log('Done');
            return;
        }
        try{
            convertFile('./temp.svg',{
                quality:100,
                width:540,
                height:800
            }).then(()=>{
                console.log('moving file', './output/card'+cIndex+'.jpg');
                fs.copyFileSync('temp.jpeg', './output/card'+cIndex+'.jpg');
                if(cIndex+1>=cards.length){
                    console.log('Done');
                    return;
                }else{
                    fn();
                }
            }).catch(()=>{
                cIndex--;
                fn();
            })
        }catch(e){
            cIndex--;
            fn();
        }
    }

    fn();
}

function generateTTSPages(){
    var img = (src, x, y, w, h,) => {
        return '<image x="'+x+'px" y="'+y+'px" width="'+w+'px" height="'+h+'px" xlink:href="./output/'+src+'"/>'
    };
    
    var x = 0;
    var y = 0;
    var cols = 0; 
    var cnt = 0;
    var width = 540;
    var height = 800;
    var totalWidth = width * 10;
    var totalHeight = height * 7;
    var images = '';
    var backImages = '';
    var sets = [];
    var backSets = [];
    var backs = ['Stay', 'Up', 'Down', 'Up'];
    
    var bIndex = -1;
    for(var i=0;i<cards.length;i++){
        cnt++;
        bIndex++;
        if(bIndex>=backs.length){
            bIndex = 0;
        }
        if(cnt>=70){
            sets.push(images);
            backSets.push(backImages);
            x = 0;
            y = 0;
            cols = 0; 
            cnt = 1;
            images = '';
            backImages = '';
        }
        images += img('card'+i+'.jpg', x, y, width, height);
        backImages += img('PandemicBack'+backs[bIndex]+'.jpg', x, y, width, height);
        console.log('x', x, 'y', y);
        cols++;
        if(cols>=10){
            cols = 0;
            x = 0;
            y = y + height;
        }else{
            x = x + width;
        }
    }
    
    console.log(totalWidth, totalHeight);
    
    if(images.length>0){
        sets.push(images);
        backSets.push(backImages);
    }
    
    
    var template = fs.readFileSync('./TTSTemplate.svg').toString();
    fs.writeFileSync('./page1.svg',Mustache.render(template,{
        totalWidth: totalWidth,
        totalHeight: totalHeight,
        images: sets[0]
    }));
    convertFile('./page1.svg',{
        quality:100,
        width:totalWidth,
        height:totalHeight
    }).then(()=>{
        console.log('page1');
        fs.copyFileSync('page1.jpeg', './output/Page1.jpg');
        fs.writeFileSync('./page2.svg',Mustache.render(template,{
            totalWidth: totalWidth,
            totalHeight: totalHeight,
            images: sets[1]
        }));
        convertFile('./page2.svg',{
            quality:100,
            width:totalWidth,
            height:totalHeight    
        }).then(()=>{
            console.log('page2');    
            fs.copyFileSync('page2.jpeg', './output/Page2.jpg');
            fs.writeFileSync('./page3.svg',Mustache.render(template,{
                totalWidth: totalWidth,
                totalHeight: totalHeight,
                images: sets[2]
            }));
            // convertFile('./page3.svg',{
            //     quality:100,
            //     width:totalWidth,
            //     height:totalHeight        
            // }).then(()=>{
            //     console.log('page3');
            //     fs.copyFileSync('page3.jpeg', './output/Page3.jpg');
            //     fs.writeFileSync('./back1.svg',Mustache.render(template,{
            //         totalWidth: totalWidth,
            //         totalHeight: totalHeight,
            //         images: backSets[0]
            //     }));
            //     // convertFile('./back1.svg',{
            //     //     quality:100,
            //     //     width:totalWidth,
            //     //     height:totalHeight
            //     // }).then(()=>{
            //     //     console.log('back1');
            //     //     fs.copyFileSync('back1.jpeg', './output/back1.jpg');
            //     //     fs.writeFileSync('./back2.svg',Mustache.render(template,{
            //     //         totalWidth: totalWidth,
            //     //         totalHeight: totalHeight,
            //     //         images: backSets[1]
            //     //     }));
            //     //     convertFile('./back2.svg',{
            //     //         quality:100,
            //     //         width:totalWidth,
            //     //         height:totalHeight    
            //     //     }).then(()=>{
            //     //         console.log('back2');    
            //     //         fs.copyFileSync('back2.jpeg', './output/back2.jpg');
            //     //         fs.writeFileSync('./back3.svg',Mustache.render(template,{
            //     //             totalWidth: totalWidth,
            //     //             totalHeight: totalHeight,
            //     //             images: backSets[2]
            //     //         }));
            //     //         convertFile('./back3.svg',{
            //     //             quality:100,
            //     //             width:totalWidth,
            //     //             height:totalHeight        
            //     //         }).then(()=>{
            //     //             console.log('back3');
            //     //             fs.copyFileSync('back3.jpeg', './output/back3.jpg');
            //     //         }).catch(()=>{
            //     //         })        
            //     //     }).catch(()=>{
            //     //     })    
            //     // }).catch(()=>{
            //     // })                  
            // }).catch(()=>{
            // })        
        }).catch(()=>{
        })    
    }).catch(()=>{
    })    
}



function generateHelperCards(){
    convertFile('./PandemicBack.svg',{
        quality:100,
        width:540,
        height:800
    }).then(()=>{
        fs.copyFileSync('PandemicBack.jpeg', './output/PandemicBack.jpg');
    }).catch(()=>{
    })

    // convertFile('./PandemicBackStay.svg',{
    //     quality:100,
    //     width:540,
    //     height:800
    // }).then(()=>{
    //     fs.copyFileSync('PandemicBackStay.jpeg', './output/PandemicBackStay.jpg');
    // }).catch(()=>{
    // })    

    // convertFile('./PandemicBackUp.svg',{
    //     quality:100,
    //     width:540,
    //     height:800
    // }).then(()=>{
    //     fs.copyFileSync('PandemicBackUp.jpeg', './output/PandemicBackUp.jpg');
    // }).catch(()=>{
    // })     

    // convertFile('./PandemicBackDown.svg',{
    //     quality:100,
    //     width:540,
    //     height:800
    // }).then(()=>{
    //     fs.copyFileSync('PandemicBackDown.jpeg', './output/PandemicBackDown.jpg');
    // }).catch(()=>{
    // })

    convertFile('./PandemicWave.svg',{
        quality:100,
        width:540,
        height:800
    }).then(()=>{
        fs.copyFileSync('PandemicWave.jpeg', './output/PandemicWave.jpg');
    }).catch(()=>{
    })

    convertFile('./PandemicHQ.svg',{
        quality:100,
        width:540*4,
        height:800*4
    }).then(()=>{
        fs.copyFileSync('PandemicHQ.jpeg', './output/PandemicHQLarge.jpg');
    }).catch(()=>{
    })    
}

function ppin(v){
    return v * 72;
}

function generatePDF(){

    var cards = [];
    for(var i=0;i<90;i++){
        cards.push('card'+i+'.jpg');
    }
    for(var i=0;i<5;i++){
        cards.push('PandemicHQLarge.jpg');
    }
    for(var i=0;i<1;i++){
        cards.push('PandemicWave.jpg');
    }

    let pdf = new pdfkit({
       size:[ppin(12),ppin(18)]
    });

    pdf.pipe(fs.createWriteStream('pandemic-v1-12by18-PNP.pdf'));

    var cols = 5;
    var rows = 5;
    var pagewidth = 12;
    var pageheight = 18;
    var width = 2.12598;
    var height = 3.14961;
    var sx = (ppin(pagewidth)-(ppin(width)*cols))/2;
    var sy = (ppin(pageheight)-(ppin(height)*rows))/2;
    var x = sx;
    var y = sy;
    var pages = Math.ceil(cards.length/(cols*rows));

    var currentIndex = 0;

    console.log(cards);

    for(var p=1;p<=pages;p++){
        y = sy;
        for(var r=1;r<=rows;r++){
            x = sx;
            for(var c=1;c<=cols;c++){
                if(!cards[currentIndex]) continue;
                //console.log('rotating...'+cards[currentIndex].qrcode);
                //execSync('magick convert -rotate "90" -resize "'+quality+'" ./savetheearth/build/'+cards[currentIndex].fileIndex+'.jpeg ./savetheearth/dist/'+cards[currentIndex].fileIndex+'.jpg');
                console.log('currentIndex', currentIndex, cards[currentIndex]);
                pdf.image('./output/'+cards[currentIndex],x,y,{
                    width:ppin(width),
                    height:ppin(height)
                });
                x += ppin(width);
                currentIndex++;
            }
            y += ppin(height);
        }
        //back
        pdf.addPage({
            size:[ppin(pagewidth),ppin(pageheight)]
        });
        y = sy;
        for(var r=1;r<=rows;r++){
            x = sx;
            for(var c=1;c<=cols;c++){
                pdf.image('./output/PandemicBack.jpg',x,y,{
                    width:ppin(width),
                    height:ppin(height)
                });
                x += ppin(width);
            }
            y += ppin(height);
        }
        if(p!=pages){
            pdf.addPage({
                size:[ppin(pagewidth),ppin(pageheight)]
            });    
        }
    }

    pdf.end();

}

//generateCards();
generateTTSPages();
//generateHelperCards();
//generatePDF();