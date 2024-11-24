import { useUser } from "@clerk/clerk-expo";
import { useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import RideLayout from "@/components/RideLayout";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

import CustomInput from "@/components/CustomTextInput";

import { icons, images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { Rent, HomeProps } from "@/types/type";
const Home: React.FC<HomeProps> = ({ title }) => {
  const { user } = useUser();
const [searchText, setSearchText] = useState("");

  const dynamicTitle =
    title || (user?.firstName ? `Hey ${user.firstName} 👋` : "Hey 👋");

  const { setUserLocation, setDestinationLocation } = useLocationStore();

  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const {
    data: recentRentals,
    loading: loadingRents,
    error: errorRents,
  } = useFetch<Rent[]>(`/(api)/cars/rents/allRentsHomeUser/${user?.id}`);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setHasPermission(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords?.latitude!,
        longitude: location.coords?.longitude!,
      });

      setUserLocation({
        latitude: location.coords?.latitude,
        longitude: location.coords?.longitude,
        address: `${address[0].name}, ${address[0].region}`,
      });
    })();
  }, []);

  const generateAndDownloadPdf = async (
    renter: string,
    amount: number,
    paid: boolean,
    date: string,
    date_end: string,
    filename: string
  ) => {
    const htmlContent = `
  <html>
    <head>
     <style>
        /* Resetting basic styles for clean output */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Arial', sans-serif;
          background-color: #f3f4f6;
          color: #333;
          line-height: 1.6;
          margin: 0;
          padding: 0;
        }

        /* Contract Wrapper */
        .contract {
          max-width: 800px;
          margin: 20px auto;
          padding: 25px;
          background-color: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
        }

        h1 {
          color: #1f2937;
          text-align: center;
          font-size: 2em;
          margin-bottom: 20px;
        }

        /* Section Title */
        .section-title {
          font-size: 1.3em;
          color: #4b5563;
          border-bottom: 2px solid #d1d5db;
          padding-bottom: 6px;
          margin-top: 20px;
          margin-bottom: 12px;
        }

        /* Details Formatting */
        .details p {
          font-size: 0.95em;
          margin-bottom: 8px;
          color: #374151;
        }
        
        .details strong {
          color: #1f2937;
        }

        /* Table Styling */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }

        th, td {
          padding: 10px;
          text-align: left;
          border: 1px solid #d1d5db;
        }

        th {
          background-color: #f3f4f6;
          color: #1f2937;
          font-weight: 600;
        }

        td {
          background-color: #ffffff;
          color: #4b5563;
        }

        /* Signature Block */
        .signature {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 30px;
        }

        .signature div {
          width: 45%;
          text-align: center;
        }

        .signature p {
          font-size: 0.9em;
          color: #374151;
        }

        .signature-line {
          margin-top: 30px;
          height: 1px;
          background-color: #6b7280;
        }

        /* Footer Note */
        .footer-note {
          font-size: 0.85em;
          color: #6b7280;
          margin-top: 20px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <h1>Contrat de Location de Véhicule</h1>
      <div class="contract">

        <div class="details">
          <h2 class="section-title">Entête de la société de location</h2>
          <p><strong>Nom de la société:</strong> AlzLocation</p>
          <p><strong>Adresse:</strong> 17 Rue du Sergent Michel Berthet, Lyon</p>
          <p><strong>Numéro de téléphone:</strong> 04 78 12 55 39</p>
          <p><strong>Numéro SIRET:</strong> 123 456 789 00012</p>
          <p><strong>Email:</strong> contact@alzlocation.fr</p>
          <p><strong>Numéro de contrat:</strong> 1728764361879867</p>
        </div>

        <div class="details">
          <h2 class="section-title">Identification du Locataire</h2>
          <p><strong>Nom:</strong> Dupont</p>
          <p><strong>Prénom:</strong> Jean</p>
          <p><strong>Adresse:</strong> 45 Rue de Rivoli, 75001 Paris</p>
          <p><strong>Téléphone:</strong> 06 12 34 56 78</p>
          <p><strong>Email:</strong> jeandupont@email.com</p>
          <p><strong>Permis de conduire:</strong> ABC123456</p>
        </div>

        <div class="details">
          <h2 class="section-title">Identification du Véhicule</h2>
          <p><strong>Marque:</strong> BMW</p>
          <p><strong>Modèle:</strong> X3</p>
          <p><strong>Immatriculation:</strong> D2-346-VV</p>
          <p><strong>Kilométrage au départ:</strong> 15,000 km</p>
          <p><strong>État au départ:</strong> Conforme / Légères rayures</p>
        </div>

        <div class="details">
          <h2 class="section-title">Informations Générales de la Location</h2>
          <p><strong>Date de départ:</strong> 15/10/2024, 10:00</p>
          <p><strong>Date de retour prévue:</strong> 19/10/2024, 10:00</p>
          <p><strong>Lieu de prise en charge:</strong> 17 Rue du Sergent Michel Berthet, Lyon</p>
          <p><strong>Lieu de restitution:</strong> Même adresse</p>
        </div>

        <div class="details">
          <h2 class="section-title">Conditions Financières</h2>
          <p><strong>Tarif de location:</strong> 2,540 euros (inclut assurance de base et taxes)</p>
          <p><strong>Caution:</strong> 8,000 euros</p>
          <p><strong>Kilométrage autorisé:</strong> Illimité</p>
          <p><strong>Prix par km supplémentaire:</strong> 1 euro</p>
          <p><strong>État de paiement:</strong> ${paid ? "Payé" : "En attente"}</p>
          <p><strong>Mode de paiement:</strong> Carte bancaire / Virement bancaire</p>
        </div>

        <div class="details">
          <h2 class="section-title">Frais Déductibles sur la Caution</h2>
          <table>
            <tr>
              <th>Type de Dommage</th>
              <th>Montant déductible</th>
            </tr>
            <tr><td>Rayure</td><td>700 euros</td></tr>
            <tr><td>Jantes rayées</td><td>2,000 euros</td></tr>
            <tr><td>Élément endommagé (carrosserie)</td><td>1,000 euros</td></tr>
            <tr><td>Siège abîmé</td><td>150 euros</td></tr>
            <tr><td>Retour sale</td><td>150 euros</td></tr>
            <tr><td>Mise en fourrière</td><td>2,000 euros</td></tr>
            <tr><td>Dégâts majeurs</td><td>15,000 euros</td></tr>
          </table>
        </div>

        <div class="details">
          <h2 class="section-title">Conditions Générales</h2>
          <p>1. <strong>Objet:</strong> Ce contrat définit les conditions de location. Le locataire doit utiliser le véhicule selon la loi française.</p>
          <p>2. <strong>Durée:</strong> La location est valide pour la période mentionnée. Tout retard entraîne des frais.</p>
          <p>3. <strong>Utilisation:</strong> Le locataire doit traiter le véhicule avec soin.</p>
          <p>4. <strong>Assurance:</strong> Le véhicule est assuré tous risques avec franchise.</p>
          <p>5. <strong>Restitution:</strong> Le véhicule doit être restitué en bon état.</p>
          <p>6. <strong>Annulation:</strong> Non-respect des conditions entraîne l’annulation sans remboursement.</p>
          <p>7. <strong>Litiges:</strong> Les litiges seront réglés devant les tribunaux compétents.</p>
        </div>

        <div class="signature">
          <div>
            <p>Signature du locataire</p>
            <div class="signature-line"></div>
          </div>
          <div>
            <p>Signature du loueur</p>
            <div class="signature-line"></div>
          </div>
        </div>
      </div>
    </body>
  </html>
`;


    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      await Sharing.shareAsync(uri); // This will allow users to download or share the PDF
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handleInputChange = (text: string) => {
    setSearchText(text);
  };

  const handleIconClick = () => {
    router.push(`/find-ride`);
  };

  return (
    <RideLayout title={dynamicTitle}>
      <ScrollView className="bg-white p-4">
        <View className="flex-1 justify-center items-center">
          <CustomInput
            onChangeValue={handleInputChange}
            pressableIconClick={handleIconClick} // Pass the icon click handler here
          />
        </View>
        {/* Recent Rentals Section */}
        <View className="pt-4 mb-4">
          <Text className="text-lg font-bold mb-2">Recent rentals</Text>
          {recentRentals && recentRentals.length > 0 ? (
            recentRentals.map((rent, index) => {
              const { renter, amount, paid, date, date_end } = rent;
              const startDate = new Date(date);
              const endDate = new Date(date_end);
              const daysDifference =
                (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);

              return (
                <View
                  key={index}
                  className="flex-row justify-between items-center p-4 border border-gray-200 rounded-lg mb-2"
                >
                  <View>
                    <Text className="text-base font-semibold">{renter}</Text>
                    <Text className="text-sm text-gray-600">
                      Dates: {startDate.toLocaleDateString()} -{" "}
                      {endDate.toLocaleDateString()} ({daysDifference} days)
                    </Text>
                    <Text className="text-sm">
                      Paid: {paid ? amount : "Not paid"} €
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="bg-blue-500 py-1 px-3 rounded-full"
                    onPress={() =>
                      generateAndDownloadPdf(
                        renter,
                        amount,
                        paid,
                        date,
                        date_end,
                        `Rental_Contract_${renter}_${endDate.toLocaleDateString()}`
                      )
                    }
                  >
                    <Text className="text-white text-center text-sm">PDF</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <Text className="text-sm text-gray-600">No recent rides</Text>
          )}
        </View>
      </ScrollView>
    </RideLayout>
  );
};

export default Home;
