export default async function handler(req, res) {
  const { placeIds = "", universeIds = "" } = req.query;

  if (!placeIds) {
    return res.status(200).json({ icons: [], placeThumbs: [], universeThumbs: [] });
  }

  try {
    const iconUrl = `https://thumbnails.roproxy.com/v1/places/gameicons?placeIds=${placeIds}&size=150x150&format=Png&isCircular=false`;
    const placeThumbUrl = `https://thumbnails.roproxy.com/v1/games/icons?placeIds=${placeIds}&size=512x512&format=Png&isCircular=false`;
    const universeThumbUrl = universeIds 
      ? `https://thumbnails.roproxy.com/v1/games/multiget/thumbnails?universeIds=${universeIds}&countPerUniverse=1&size=768x432&format=Png`
      : null;

    const fetches = [
      fetch(iconUrl).then(r => r.json()).catch(() => ({})),
      fetch(placeThumbUrl).then(r => r.json()).catch(() => ({}))
    ];

    if (universeThumbUrl) {
      fetches.push(fetch(universeThumbUrl).then(r => r.json()).catch(() => ({})));
    }

    const [iconRes, placeThumbRes, thumbRes] = await Promise.all(fetches);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

    return res.status(200).json({
      icons: iconRes.data || [],
      placeThumbs: placeThumbRes.data || [],
      universeThumbs: thumbRes?.data || []
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch thumbnails" });
  }
}
