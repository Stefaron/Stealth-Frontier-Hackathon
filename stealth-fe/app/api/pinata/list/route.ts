import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const auditor = searchParams.get("auditor");

    if (!auditor) {
      return NextResponse.json({ error: "Missing auditor parameter" }, { status: 400 });
    }

    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      return NextResponse.json({ error: "PINATA_JWT not configured on server" }, { status: 500 });
    }

    // Query Pinata for files with metadata.auditor === auditor
    const metadataQuery = JSON.stringify({
      auditor: { value: auditor, op: "eq" }
    });
    
    const response = await fetch(`https://api.pinata.cloud/data/pinList?status=pinned&metadata[keyvalues]=${encodeURIComponent(metadataQuery)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata API error: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json({ rows: data.rows });
  } catch (error) {
    console.error("Pinata list error:", error);
    return NextResponse.json({ error: "Failed to list from IPFS" }, { status: 500 });
  }
}
