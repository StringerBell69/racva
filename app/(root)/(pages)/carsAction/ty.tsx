import { View, Text, ScrollView, StyleSheet } from "react-native";


import { useState, useEffect } from "react";

import CustomButton from "@/components/CustomButton";

import { VictoryPie, VictoryBar } from "victory"; // Importing from victory

interface DailyRevenue {
  date: string;
  amount: number;
}

interface CarRevenue {
  car: string;
  revenue: number;
}

const ModifyCar = ({ title = "Add Car", snapPoints = ["100%"] }) => {

    const [totalRevenue, setTotalRevenue] = useState<number>(0);
 const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
 const [carRevenue, setCarRevenue] = useState<CarRevenue[]>([]);
 const [loading, setLoading] = useState<boolean>(true);
 const fetchMetrics = async () => {
    setLoading(true);
    try {
      const revenue = { total: 12500 }; // Mock total revenue
      const daily: DailyRevenue[] = [
        { date: "2024-10-25", amount: 200 },
        { date: "2024-10-26", amount: 300 },
      ];
      const carRev: CarRevenue[] = [
        { car: "Toyota Prius", revenue: 1200 },
        { car: "Honda Accord", revenue: 900 },
      ];

      setTotalRevenue(revenue.total);
      setDailyRevenue(daily);
      setCarRevenue(carRev);
    } catch (error) {
      console.log("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  section: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4CAF50",
    marginTop: 5,
  },
});
 

  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Car Dashboard</Text>

      <View style={styles.section}>
        <Text style={styles.title}>Total Revenue</Text>
        <Text style={styles.value}>${totalRevenue.toFixed(2)}</Text>
      </View>

      {/* Daily Revenue (Bar Chart) */}
      <View style={styles.section}>
        <Text style={styles.title}>Daily Revenue</Text>
        <VictoryBar
          data={dailyRevenue}
          x="date"
          y="amount"
          style={{
            data: { fill: "#4CAF50" },
            labels: { fontSize: 12, fill: "#333" },
          }}
        />
      </View>

      {/* Revenue per Car (Pie Chart) */}
      <View style={styles.section}>
        <Text style={styles.title}>Revenue per Car</Text>
        <VictoryPie
          data={carRevenue}
          x="car"
          y="revenue"
          colorScale="cool"
          innerRadius={50}
          labelRadius={75}
          style={{ labels: { fontSize: 10, fill: "#333" } }}
        />
      </View>

      <CustomButton title="Refresh" onPress={fetchMetrics} />
    </ScrollView>
  );
}


export default ModifyCar;
