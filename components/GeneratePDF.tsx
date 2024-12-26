import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

interface ContractData {
  // Company details
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companySiret?: string;
  companyEmail?: string;
  contractNumber?: string;

  // Renter details
  renterFirstName: string;
  renterLastName?: string;
  renterAddress?: string;
  renterPhone?: string;
  renterEmail?: string;
  driverLicense?: string;

  // Vehicle details
  vehicleBrand?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  initialMileage?: number;
  vehicleCondition?: string;

  // Rental details
  startDate: string;
  endDate: string;
  pickupLocation?: string;
  returnLocation?: string;
  rentalPrice: number;
  deposit?: number;
  mileageLimit?: string;
  extraKmPrice?: number;
  isPaid: boolean;
  paymentMethod?: string;
}

export const generateAndDownloadPdf = async (data: ContractData) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const htmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          margin: 15mm;
          size: A4;
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Arial', sans-serif;
          color: #333;
          line-height: 1.6;
          background-color: white;
        }

        .page-break {
          page-break-before: always;
        }

        .contract {
          max-width: 100%;
          margin: 0 auto;
          padding: 20px;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #1a365d;
          padding-bottom: 20px;
        }

        h1 {
          color: #1a365d;
          font-size: 24px;
          margin-bottom: 15px;
        }

        .section-title {
          font-size: 18px;
          color: #1a365d;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 8px;
          margin: 25px 0 15px 0;
        }

        .details {
          margin-bottom: 20px;
        }

        .details p {
          font-size: 14px;
          margin-bottom: 8px;
          color: #2d3748;
        }
        
        .details strong {
          color: #1a365d;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 14px;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border: 1px solid #e2e8f0;
        }

        th {
          background-color: #f8fafc;
          color: #1a365d;
          font-weight: 600;
        }

        .signature-section {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
        }

        .signature-box {
          width: 45%;
        }

        .signature-line {
          margin-top: 50px;
          border-top: 1px solid #2d3748;
          padding-top: 10px;
          text-align: center;
          font-size: 14px;
        }

        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #718096;
        }

        .conditions {
          font-size: 14px;
          margin: 20px 0;
        }

        .conditions p {
          margin-bottom: 10px;
          text-align: justify;
        }
      </style>
    </head>
    <body>
      <div class="contract">
        <div class="header">
          <h1>Contrat de Location de Véhicule</h1>
          <p>N° ${data.contractNumber || "_____________"}</p>
        </div>

        <div class="details">
          <h2 class="section-title">Société de Location</h2>
          <p><strong>Nom de la société:</strong> ${data.companyName || "_____________"}</p>
          <p><strong>Adresse:</strong> ${data.companyAddress || "_____________"}</p>
          <p><strong>Téléphone:</strong> ${data.companyPhone || "_____________"}</p>
          <p><strong>SIRET:</strong> ${data.companySiret || "_____________"}</p>
          <p><strong>Email:</strong> ${data.companyEmail || "_____________"}</p>
        </div>

        <div class="details">
          <h2 class="section-title">Informations du Locataire</h2>
          <p><strong>Nom:</strong> ${data.renterLastName || "_____________"}</p>
          <p><strong>Prénom:</strong> ${data.renterFirstName}</p>
          <p><strong>Adresse:</strong> ${data.renterAddress || "_____________"}</p>
          <p><strong>Téléphone:</strong> ${data.renterPhone || "_____________"}</p>
          <p><strong>Email:</strong> ${data.renterEmail || "_____________"}</p>
          <p><strong>Permis de conduire:</strong> ${data.driverLicense || "_____________"}</p>
        </div>

        <div class="details">
          <h2 class="section-title">Véhicule</h2>
          <p><strong>Marque:</strong> ${data.vehicleBrand || "_____________"}</p>
          <p><strong>Modèle:</strong> ${data.vehicleModel || "_____________"}</p>
          <p><strong>Immatriculation:</strong> ${data.vehiclePlate || "_____________"}</p>
          <p><strong>Kilométrage initial:</strong> ${data.initialMileage ? `${data.initialMileage} km` : "_____________"}</p>
          <p><strong>État:</strong> ${data.vehicleCondition || "_____________"}</p>
        </div>

        <div class="page-break"></div>

        <div class="details">
          <h2 class="section-title">Détails de la Location</h2>
          <p><strong>Date de début:</strong> ${formatDate(data.startDate)}</p>
          <p><strong>Date de fin:</strong> ${formatDate(data.endDate)}</p>
          <p><strong>Lieu de prise en charge:</strong> ${data.pickupLocation || "_____________"}</p>
          <p><strong>Lieu de restitution:</strong> ${data.returnLocation || "_____________"}</p>
          <p><strong>Prix de la location:</strong> ${formatPrice(data.rentalPrice)}</p>
          <p><strong>Caution:</strong> ${data.deposit ? formatPrice(data.deposit) : "_____________"}</p>
          <p><strong>Kilométrage autorisé:</strong> ${data.mileageLimit || "Illimité"}</p>
          <p><strong>Prix par km supplémentaire:</strong> ${data.extraKmPrice ? formatPrice(data.extraKmPrice) : "_____________"}</p>
          <p><strong>Statut du paiement:</strong> ${data.isPaid ? "Payé" : "En attente"}</p>
          <p><strong>Mode de paiement:</strong> ${data.paymentMethod || "_____________"}</p>
        </div>

        <div class="details">
          <h2 class="section-title">Frais de Dommages</h2>
          <table>
            <tr>
              <th>Type de Dommage</th>
              <th>Montant</th>
            </tr>
            <tr><td>Rayure</td><td>700 €</td></tr>
            <tr><td>Jantes rayées</td><td>2 000 €</td></tr>
            <tr><td>Élément carrosserie</td><td>1 000 €</td></tr>
            <tr><td>Siège abîmé</td><td>150 €</td></tr>
            <tr><td>Retour sale</td><td>150 €</td></tr>
            <tr><td>Mise en fourrière</td><td>2 000 €</td></tr>
            <tr><td>Dégâts majeurs</td><td>15 000 €</td></tr>
          </table>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line">Signature du locataire</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">Signature du loueur</div>
          </div>
        </div>

        <div class="footer">
          <p>Document généré le ${new Date().toLocaleDateString("fr-FR")}</p>
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
    await Sharing.shareAsync(uri);
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    throw error;
  }
};
