import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { encryptedData, auditorAddress, contributorAddress } = body;

    if (!encryptedData || !auditorAddress || !contributorAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      return NextResponse.json({ error: "PINATA_JWT not configured on server" }, { status: 500 });
    }

    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: JSON.stringify({
        pinataContent: encryptedData,
        pinataMetadata: {
          name: `stealth-report-${auditorAddress.slice(0, 8)}`,
          keyvalues: {
            auditor: auditorAddress,
            contributor: contributorAddress,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata API error: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json({ ipfsHash: data.IpfsHash });
  } catch (error) {
    console.error("Pinata upload error:", error);
    return NextResponse.json({ error: "Failed to upload to IPFS" }, { status: 500 });
  }
}
