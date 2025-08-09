"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { foundry } from "viem/chains";
import { DebugContractService } from "../../../services/debugContractService";

export const BlockchainDebugTest = () => {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  const [testResults, setTestResults] = useState<string[]>([]);
  
  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    addResult("Starting connection test...");
    
    try {
      const service = new DebugContractService();
      const result = await service.testConnection();
      addResult(`Connection test result: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      addResult(`Connection test failed: ${error}`);
    }
  };

  const testMarketCreation = async () => {
    addResult("Starting market creation test...");
    
    if (!address) {
      addResult("No wallet connected");
      return;
    }
    
    try {
      const service = new DebugContractService();
      const marketData = {
        question: "Debug Test Market",
        description: "Testing market creation from frontend",
        category: "Debug",
        resolutionSource: "Manual",
        endTime: Math.floor(Date.now() / 1000) + 86400, // 1 day from now
        tags: ["debug", "test"]
      };
      
      const result = await service.createMarket(marketData, address);
      addResult(`Market creation result: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      addResult(`Market creation failed: ${error}`);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">🔧 Blockchain Connection Debug</h1>
      
      {/* Connection Status */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">📡 Connection Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Connected:</strong> {isConnected ? "✅ Yes" : "❌ No"}</p>
              <p><strong>Address:</strong> {address || "None"}</p>
              <p><strong>Chain:</strong> {chain?.name || "None"} ({chain?.id || "None"})</p>
              <p><strong>Expected Chain:</strong> {foundry.name} ({foundry.id})</p>
            </div>
            <div>
              <p><strong>Chain Match:</strong> {chain?.id === foundry.id ? "✅ Correct" : "❌ Wrong"}</p>
              <p><strong>Anvil Expected:</strong> localhost:8545</p>
              <p><strong>Contract Address:</strong> 0x5FbDB2315678afecb367f032d93F642f64180aa3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Controls */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">🔌 Connection Controls</h2>
          <div className="flex flex-wrap gap-4">
            {!isConnected ? (
              connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  className="btn btn-primary"
                >
                  Connect {connector.name}
                </button>
              ))
            ) : (
              <button onClick={() => disconnect()} className="btn btn-secondary">
                Disconnect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">🧪 Test Controls</h2>
          <div className="flex flex-wrap gap-4">
            <button onClick={testConnection} className="btn btn-info">
              Test Blockchain Connection
            </button>
            <button 
              onClick={testMarketCreation} 
              className="btn btn-success"
              disabled={!isConnected}
            >
              Test Market Creation
            </button>
            <button 
              onClick={() => setTestResults([])} 
              className="btn btn-outline"
            >
              Clear Results
            </button>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">📊 Test Results</h2>
          <div className="mockup-code max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <pre data-prefix=">" className="text-warning">
                <code>No test results yet. Run a test to see output.</code>
              </pre>
            ) : (
              testResults.map((result, index) => (
                <pre key={index} data-prefix={index + 1} className="text-sm">
                  <code>{result}</code>
                </pre>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
