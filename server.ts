import bodyParser from "body-parser";
import prisma from "./prisma";

import express from "express";
const app = express();

const port = 3000;

app.use(bodyParser.json());

app.get("/", (req: any, res: any) => {
  const users = prisma.restaurant.findMany();

  res.json(users);
});

app.post("/", async (req, res) => {
  let {
    detailedTitle,
    restaurantTitle,
    ratingOverall,
    ratingOverallNumber,
    restaurantWebsiteLink,
    locationAddress,
    openDates,
    images,
    reviews,
  } = req.body;

  let foundLocationString: any;
  let latRestaurant;
  let lngRestaurant;
  const fetchFilteredRestaurant = async (searchInput: string) => {
    if (searchInput) {
      const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${searchInput}&types=geocode&language=tr&region=tr&key=AIzaSyBsII7ydj7aLdU2eQhVz2vvzNmf7fcwRc0`;

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log(JSON.stringify(data, null, "\t"));
        if (data.status === "OK") {
          const likelyIstanbul = data.predictions
            .filter((prediction: any) =>
              prediction.description
                .toLocaleLowerCase("tr-TR") // bu amına kodumun kodu yüzünden çalıştı tr nin amk
                .includes("istanbul")
            )
            .map((prediction: any) => ({
              name: prediction.description,
              placeId: prediction.place_id,
            }));

          foundLocationString = likelyIstanbul;
        } else {
          console.error("Error fetching street data:", data.error_message);
        }
      } catch (error) {
        console.error("Failed to fetch street data:", error);
      }
    } else {
      // Optionally reset filteredData if searchInput is empty
      foundLocationString = null;
    }
  };
  const handleLocationSelection = async (placeId: string, name: string) => {
    if (placeId) {
      const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=AIzaSyBsII7ydj7aLdU2eQhVz2vvzNmf7fcwRc0`;
      try {
        const response = await fetch(placeDetailsUrl);
        const data = await response.json();
        console.log(JSON.stringify(data, null, "\t"));
        if (data.status === "OK") {
          const { lat, lng } = data.result.geometry.location;
          (latRestaurant = lat), (lngRestaurant = lng);
        } else {
          console.error("Error fetching street data:", data.error_message);
        }
      } catch (error) {
        console.error("Failed to fetch street data:", error);
      }
    } else {
      console.log("buraya mı girdin")
      latRestaurant = null;
      lngRestaurant = null;
    }
  };
  await fetchFilteredRestaurant(locationAddress);
  console.log("founded place id" + JSON.stringify(foundLocationString, null, 2));
  

  if (foundLocationString === undefined || foundLocationString === null || !foundLocationString) {
    latRestaurant = null;
    lngRestaurant = null;
  } else {
    console.log("durum vahim mi" + foundLocationString.slice(0,1).map((item: any) =>  {
      return item.placeId
    }) )
    const bruh = foundLocationString.slice(0,1).map((item: any) =>  {
      return item.placeId
    })
    await handleLocationSelection(
      bruh,
      foundLocationString.name
    );
    console.log("founded lat and lng" + latRestaurant, lngRestaurant);
  }


 
 
  try {
    const restaurant = await prisma.restaurant.create({
      data: {
        detailedTitle,
        restaurantTitle,
        ratingOverall,
        ratingOverallNumber,
        restaurantWebsiteLink,
        locationAddress,

        restaurantLat: latRestaurant,
        restaurantLng: lngRestaurant,

         ...(openDates !== null
      ? { openDates: { create: openDates } }
      : {}),
    ...(reviews !== null ? { reviews: { create: reviews } } : {}),
    ...(images !== null ? { images: { create: images } } : {}),
        
      },
    });

    res.status(200).json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
