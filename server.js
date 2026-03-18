import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const REAL_DEBRID_TOKEN = process.env.REAL_DEBRID_TOKEN;

const PROVIDERS = [
  "vidsrcme","vidlink","vidsrc","super","multiembed",
  "erogarga","tubeclassic","xnxx","xvideos","noodlemagazine",
  "allclassicporn","cat3movies","film1k","tube8","youporn",
  "pornhub","spankbang","empflix","tnaflix","xhamster",
  "redtube","pornhd","openload","streamtape","fembed",
  "mixdrop","doodstream","rapidvideo","mp4upload","okru"
];

async function getRealDebridLinks(imdbId, type) {
  // Örnek: gerçek Real Debrid API ile entegre edilecek
  return [
    { url: `https://rd.example.com/${imdbId}-4k.mp4`, resolution: "4K", hdr: true, bitrate: 12000 },
    { url: `https://rd.example.com/${imdbId}-1080.mp4`, resolution: "1080p", hdr: false, bitrate: 8000 }
  ];
}

async function getFreeProviderLinks(query) {
  return PROVIDERS.map(p => ({
    url: `https://${p}.example.com/${query}`,
    resolution: "1080p",
    hdr: false,
    bitrate: 6000
  }));
}

async function getTRSubtitle(query) {
  return [
    { url: `https://subtitles.example.com/${query}.tr.srt`, lang: "tr" }
  ];
}

app.get("/api/getVideo", async (req,res)=>{
  const { imdbId, title, type } = req.query;
  let sources = [];

  if(REAL_DEBRID_TOKEN){
    sources = await getRealDebridLinks(imdbId,type);
  }

  if(!sources.some(s=>s.resolution==="4K")){
    const freeSources = await getFreeProviderLinks(title);
    sources = [...sources,...freeSources];
  }

  // 4K öncelikli + bitrate sıralama
  sources.sort((a,b)=>{
    if(a.resolution==="4K" && b.resolution!=="4K") return -1;
    if(b.resolution==="4K" && a.resolution!=="4K") return 1;
    return (b.bitrate||0) - (a.bitrate||0);
  });

  const subtitles = await getTRSubtitle(title);
  res.json({ selected: sources[0], all: sources, subtitles });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));