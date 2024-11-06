import { createNft, fetchDigitalAsset, findMetadataPda, mplTokenMetadata, verifyCollection, verifyCollectionV1 } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { generateSigner, keypairIdentity, percentAmount,publicKey } from "@metaplex-foundation/umi";

// QuickNode endpoint
const QUICKNODE_RPC = "https://attentive-frequent-waterfall.solana-devnet.quiknode.pro/d85a5fae3a7162b5a0146549859de0dec03181ce";

async function main() {
  // 使用 QuickNode endpoint 创建 connection
  const connection = new Connection(QUICKNODE_RPC);
  
  // 创建 umi 实例
  const umi = createUmi(connection.rpcEndpoint);
  umi.use(mplTokenMetadata());
  
  const user = await getKeypairFromFile("");
  
  // 请求空投
  await airdropIfRequired(
    connection, 
    user.publicKey, 
    1 * LAMPORTS_PER_SOL, 
    0.5 * LAMPORTS_PER_SOL
  );

  console.log("loaded user", user.publicKey.toBase58());

  const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
  umi.use(keypairIdentity(umiUser));

  console.log("set up umi instance for user");

  const collectionAddress = publicKey("33Jbo6xEeDRpXZNatJqWTuw33Dm6LQma6udA2dGqsbYE");

  const nftAddress = publicKey("BWQ81zr7AXtccwd9B1gggfcAWcXcxB7K75bBJ8NbXAaW"); 

  const transaction = await verifyCollectionV1(umi,{
    metadata:findMetadataPda(umi,{mint:nftAddress}),
    collectionMint:collectionAddress,
    authority: umi.identity,
  });

  await transaction.sendAndConfirm(umi);

  console.log(`NFT: ${nftAddress} verified, see it on Solana Explorer: ${getExplorerLink("address", nftAddress)}`);
}

main();