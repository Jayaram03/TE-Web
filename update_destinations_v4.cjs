
const fs = require('fs');
const path = require('path');

const destinationsPath = path.join(__dirname, 'src/data/destinations.js');
let content = fs.readFileSync(destinationsPath, 'utf8');

const premiumMedia = {
    // DOMESTIC
    "thekkady": { region: "Kerala", image: "https://images.unsplash.com/photo-1596324683526-0e360982df44?auto=format&fit=crop&w=1200&q=80" },
    "varkala": { region: "Kerala", image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80" },
    "vagamon": { region: "Kerala", image: "https://images.unsplash.com/photo-1449557618206-8dce28269e88?auto=format&fit=crop&w=1200&q=80" },
    "munnar": { region: "Kerala", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80" },
    "alleppey": { region: "Kerala", image: "https://images.unsplash.com/photo-1593693397690-362cb9666c64?auto=format&fit=crop&w=1200&q=80" },
    "kumblangi": { region: "Kerala", image: "https://images.unsplash.com/photo-1524388478442-998816c274da?auto=format&fit=crop&w=1200&q=80" },
    "kochi": { region: "Kerala", image: "https://images.unsplash.com/photo-1579895089201-387063462584?auto=format&fit=crop&w=1200&q=80" },
    "wayanad": { region: "Kerala", image: "https://images.unsplash.com/photo-1526718583451-e8d1323cd706?auto=format&fit=crop&w=1200&q=80" },
    "kodaikanal": { region: "Tamil Nadu", image: "https://images.unsplash.com/photo-1582294132338-89c0a6b16eb3?auto=format&fit=crop&w=1200&q=80" },
    "ooty": { region: "Tamil Nadu", image: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=1200&q=80" },
    "yercaud": { region: "Tamil Nadu", image: "https://images.unsplash.com/photo-1616428782928-87431ef80a06?auto=format&fit=crop&w=1200&q=80" },
    "chikmangalur": { region: "Karnataka", image: "https://images.unsplash.com/photo-1616428782928-87431ef80a06?auto=format&fit=crop&w=1200&q=80" }, // Fallback to nature
    "coorg": { region: "Karnataka", image: "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1200&q=80" },
    "mulki": { region: "Karnataka", image: "https://images.unsplash.com/photo-1502680399480-c8cd41f021f1?auto=format&fit=crop&w=1200&q=80" },
    "goa": { region: "Goa", image: "https://images.unsplash.com/photo-1512789172734-7b099dbd15a6?auto=format&fit=crop&w=1200&q=80" },
    "gandikota": { region: "Andhra Pradesh", image: "https://images.unsplash.com/photo-1627893111425-636959955403?auto=format&fit=crop&w=1200&q=80" },
    "jaisalmer": { region: "Rajasthan", image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80" }, // Using Rajasthan fort
    "golden-triangle": { region: "North India", image: "https://images.unsplash.com/photo-1564507592333-c60657451dd7?auto=format&fit=crop&w=1200&q=80" },
    "manali": { region: "Himachal", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80" },
    "kashmir": { region: "Kashmir", image: "https://images.unsplash.com/photo-1566833917719-5d4689736569?auto=format&fit=crop&w=1200&q=80" },
    "ladakh": { region: "Ladakh", image: "https://images.unsplash.com/photo-1596895111956-bf1031d8c6b3?auto=format&fit=crop&w=1200&q=80" },
    "sikkim": { region: "North East", image: "https://images.unsplash.com/photo-1490237014491-822aee911b99?auto=format&fit=crop&w=1200&q=80" },
    "meghalaya": { region: "North East", image: "https://images.unsplash.com/photo-1590742131233-146313a401f8?auto=format&fit=crop&w=1200&q=80" },

    // INTERNATIONAL
    "dubai": { region: "Middle East", image: "https://images.unsplash.com/photo-1512453979798-5ea4c16139d6?auto=format&fit=crop&w=1200&q=80" },
    "bali": { region: "SE Asia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80" },
    "cairo": { region: "Middle East", image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80" },
    "thailand": { region: "SE Asia", image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80" },
    "vietnam": { region: "SE Asia", image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80" },
    "malaysia": { region: "SE Asia", image: "https://images.unsplash.com/photo-1596422846543-75c6fc18a593?auto=format&fit=crop&w=1200&q=80" },
    "singapore": { region: "SE Asia", image: "https://images.unsplash.com/photo-1525625239912-9405fe4f568c?auto=format&fit=crop&w=1200&q=80" },
    "srilanka": { region: "South Asia", image: "https://images.unsplash.com/photo-1546708973-b339540b3362?auto=format&fit=crop&w=1200&q=80" },
    "kazakhstan": { region: "Central & East Asia", image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&w=1200&q=80" },
    "georgia": { region: "Europe", image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80" },
    "europe": { region: "Europe", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80" },
    "maldives": { region: "South Asia", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80" },
    "japan": { region: "Central & East Asia", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80" }
};

// Process the content
const startIndex = content.indexOf('[');
const endIndex = content.lastIndexOf(']') + 1;
const arrayStr = content.substring(startIndex, endIndex);

const destinations = eval(arrayStr);

const updatedDestinations = destinations.map(d => {
    const media = premiumMedia[d.id];
    if (media) {
        return {
            ...d,
            image: media.image,
            region: media.region
        };
    }
    return d;
});

const newContent = `export const destinations = ${JSON.stringify(updatedDestinations, null, 4)};\n`;
fs.writeFileSync(destinationsPath, newContent);
console.log('Successfully updated destinations.js with premium HD images and region metadata.');
