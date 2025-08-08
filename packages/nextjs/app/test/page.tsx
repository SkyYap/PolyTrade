"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ApiTestResult {
  endpoint: string;
  status: "loading" | "success" | "error";
  data?: any;
  error?: string;
}

const TestPage = () => {
  const [results, setResults] = useState<ApiTestResult[]>([]);

  useEffect(() => {
    const testEndpoints = async () => {
      const endpoints = [
        {
          name: "Kalshi Events",
          url: "http://localhost:3001/api/kalshi/events?limit=2",
        },
        {
          name: "Kalshi Markets",
          url: "http://localhost:3001/api/kalshi/markets?limit=2",
        },
        {
          name: "Polymarket Events",
          url: "http://localhost:3001/api/polymarket/events?limit=2",
        },
      ];

      const testResults: ApiTestResult[] = [];

      for (const endpoint of endpoints) {
        const result: ApiTestResult = {
          endpoint: endpoint.name,
          status: "loading",
        };

        try {
          const response = await fetch(endpoint.url);
          const data = await response.json();

          if (response.ok) {
            result.status = "success";
            result.data = data;
          } else {
            result.status = "error";
            result.error = data.message || "API Error";
          }
        } catch (error) {
          result.status = "error";
          result.error = error instanceof Error ? error.message : "Network Error";
        }

        testResults.push(result);
      }

      setResults(testResults);
    };

    testEndpoints();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">PolyTrade API Test</h1>

      <div className="grid gap-6">
        {results.map((result, index) => (
          <div key={index} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                {result.endpoint}
                <div
                  className={`badge ${
                    result.status === "success"
                      ? "badge-success"
                      : result.status === "error"
                        ? "badge-error"
                        : "badge-info"
                  }`}
                >
                  {result.status}
                </div>
              </h2>

              {result.status === "loading" && (
                <div className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>Testing API endpoint...</span>
                </div>
              )}

              {result.status === "success" && result.data && (
                <div>
                  <p className="text-success mb-2">✅ API connection successful!</p>
                  <div className="collapse collapse-arrow bg-base-200">
                    <input type="checkbox" />
                    <div className="collapse-title text-sm font-medium">View Response Data</div>
                    <div className="collapse-content">
                      <pre className="text-xs overflow-auto bg-base-300 p-2 rounded">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {result.status === "error" && (
                <div>
                  <p className="text-error mb-2">❌ API connection failed</p>
                  <div className="bg-error/10 p-3 rounded text-error text-sm">{result.error}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="flex gap-4 justify-center">
          <Link href="/" className="btn btn-primary">
            Go to Home
          </Link>
          <Link href="/arbitrage" className="btn btn-secondary">
            View Arbitrage
          </Link>
          <Link href="/markets" className="btn btn-accent">
            View Markets
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
