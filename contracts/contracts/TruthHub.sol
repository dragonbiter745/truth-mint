// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TruthHub
 * @notice Stores verification proofs from Flare oracles (FTSO + FDC)
 */
contract TruthHub {
    struct VerificationProof {
        string claim;
        bool isVerified;
        uint8 confidenceScore; // 0-100
        uint256 timestamp;
        string dataSource; // "FTSO", "FDC", or "HYBRID"
        address verifier;
        string ftsoData; // Price/data from FTSO
        string fdcData; // External data from FDC
    }

    mapping(uint256 => VerificationProof) public proofs;
    uint256 public proofCount;

    event ProofRegistered(
        uint256 indexed proofId,
        string claim,
        bool isVerified,
        uint8 confidenceScore,
        string dataSource
    );

    /**
     * @notice Register a new verification proof
     */
    function registerProof(
        string memory _claim,
        bool _isVerified,
        uint8 _confidenceScore,
        string memory _dataSource,
        string memory _ftsoData,
        string memory _fdcData
    ) external returns (uint256) {
        require(_confidenceScore <= 100, "Invalid confidence score");
        
        uint256 proofId = proofCount++;
        
        proofs[proofId] = VerificationProof({
            claim: _claim,
            isVerified: _isVerified,
            confidenceScore: _confidenceScore,
            timestamp: block.timestamp,
            dataSource: _dataSource,
            verifier: msg.sender,
            ftsoData: _ftsoData,
            fdcData: _fdcData
        });

        emit ProofRegistered(proofId, _claim, _isVerified, _confidenceScore, _dataSource);
        
        return proofId;
    }

    /**
     * @notice Get proof details
     */
    function getProof(uint256 _proofId) external view returns (
        string memory claim,
        bool isVerified,
        uint8 confidenceScore,
        uint256 timestamp,
        string memory dataSource,
        address verifier,
        string memory ftsoData,
        string memory fdcData
    ) {
        VerificationProof memory proof = proofs[_proofId];
        return (
            proof.claim,
            proof.isVerified,
            proof.confidenceScore,
            proof.timestamp,
            proof.dataSource,
            proof.verifier,
            proof.ftsoData,
            proof.fdcData
        );
    }
}