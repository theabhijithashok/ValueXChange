import React from 'react';

const RecentTransactions = ({ transactions = [] }) => {
    return (
        <div className="bg-gray-300 rounded-lg shadow-md p-6 border border-gray-400">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transaction</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left bg-white">
                    <thead className="bg-gray-100 text-gray-800 font-semibold text-sm uppercase border-b border-gray-200">
                        <tr>
                            <th className="py-3 px-4">Transaction ID</th>
                            <th className="py-3 px-4">Item</th>
                            <th className="py-3 px-4">Final Value</th>
                            <th className="py-3 px-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                <td className="py-3 px-4">{tx.id.substring(0, 8)}...</td>
                                <td className="py-3 px-4">{tx.item}</td>
                                <td className="py-3 px-4">{tx.finalValue}</td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${tx.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {tx.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center py-4 text-gray-500">No recent transactions</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentTransactions;
