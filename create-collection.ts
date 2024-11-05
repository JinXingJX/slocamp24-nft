import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import {Connection,LAMPORTS_PER_SOL,clusterApiUrl, sendAndConfirmTransaction} from "@solana/web3.js";
import { generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";

const connection = new Connection(clusterApiUrl("devnet"));

//default use id.json
const user = await getKeypairFromFile("");

await airdropIfRequired(connection,user.publicKey,1 * LAMPORTS_PER_SOL,0.5 * LAMPORTS_PER_SOL);

console.log("loaded user", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("set up umi instance for user");

const collectionMint = generateSigner(umi);

const transaction = await createNft(umi,{
    mint:collectionMint,
    name:"My Collection",
    symbol:"MC",
    uri:"https://raw.githubusercontent.com/JinXingJX/slocamp24-jsonfiles/refs/heads/main/newnft.json",
    sellerFeeBasisPoints:percentAmount(0),
    isCollection:true
})

await transaction.sendAndConfirm(umi);

const createdCollectionNft = await fetchDigitalAsset(umi,collectionMint.publicKey);

console.log(`created collection! Address is ${getExplorerLink("address",createdCollectionNft.mint.publicKey,"devnet")}`);
