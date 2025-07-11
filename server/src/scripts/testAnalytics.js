"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const analyticsDashboard_1 = require("../utils/analyticsDashboard");
function testAnalytics() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Testing analytics system...\n");
        try {
            // Generate general report
            console.log("Generating general analytics report...");
            yield (0, analyticsDashboard_1.generateAnalyticsReport)();
            console.log("Analytics system test completed successfully!");
        }
        catch (error) {
            console.error("Analytics system test failed:", error);
        }
    });
}
// Run the test
testAnalytics();
