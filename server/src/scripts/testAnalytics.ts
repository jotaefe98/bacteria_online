import {
  generateAnalyticsReport,
  generatePlayerReport,
} from "../utils/analyticsDashboard";

async function testAnalytics() {
  console.log("Testing analytics system...\n");

  try {
    // Generate general report
    console.log("Generating general analytics report...");
    await generateAnalyticsReport();

    console.log("Analytics system test completed successfully!");
  } catch (error) {
    console.error("Analytics system test failed:", error);
  }
}

// Run the test
testAnalytics();
