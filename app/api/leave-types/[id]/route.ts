import { type NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerUser } from "@/lib/auth/server";
import { getLeaveTypesCollection } from "@/lib/mongodb/collections";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { name, description, max_days_per_year, carry_forward } = await request.json();
    if (!name || !max_days_per_year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const collection = await getLeaveTypesCollection();
    
    // Handle both ObjectId and string IDs
    const filter = ObjectId.isValid(params.id) 
      ? { _id: new ObjectId(params.id) }
      : { _id: params.id };
    
    const result = await collection.updateOne(
      filter,
      {
        $set: {
          name,
          description: description || "",
          max_days_per_year: Number(max_days_per_year),
          carry_forward: Boolean(carry_forward),
          updated_at: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Leave type not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("DELETE request for leave type ID:", params.id);
    
    const user = await getServerUser();
    if (!user) {
      console.log("No user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "admin") {
      console.log("User is not admin:", user.role);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log("Getting leave types collection...");
    const collection = await getLeaveTypesCollection();
    console.log("Collection obtained, attempting delete...");
    
    // Try multiple approaches to find and delete the document
    let result;
    
    // First try: ObjectId if valid
    if (ObjectId.isValid(params.id)) {
      console.log("Using ObjectId for deletion:", params.id);
      result = await collection.deleteOne({ _id: new ObjectId(params.id) });
    } else {
      console.log("Using string ID for deletion:", params.id);
      result = await collection.deleteOne({ _id: params.id });
    }
    
    // If not found, try alternative approaches
    if (result.deletedCount === 0) {
      console.log("First attempt failed, trying alternative approaches...");
      
      // Try with string ID as ObjectId
      if (!ObjectId.isValid(params.id)) {
        try {
          result = await collection.deleteOne({ _id: new ObjectId(params.id) });
          console.log("Alternative ObjectId attempt result:", result);
        } catch (e) {
          console.log("Alternative ObjectId attempt failed:", e);
        }
      }
      
      // Try with name field if ID doesn't work
      if (result.deletedCount === 0) {
        console.log("Trying to find by name or other fields...");
        // Get the document first to see what fields are available
        const doc = await collection.findOne({ _id: params.id });
        console.log("Found document:", doc);
        
        if (!doc) {
          // Try ObjectId version
          const docObjId = await collection.findOne({ _id: new ObjectId(params.id) });
          console.log("Found document with ObjectId:", docObjId);
        }
      }
    }
    console.log("Delete result:", result);

    if (result.deletedCount === 0) {
      console.log("No document was deleted with any approach");
      
      // List all documents to help debug
      const allDocs = await collection.find({}).toArray();
      console.log("All leave types in database:", allDocs.map(d => ({ id: d._id, name: d.name })));
      
      return NextResponse.json({ 
        error: "Leave type not found",
        debug: {
          requestedId: params.id,
          isValidObjectId: ObjectId.isValid(params.id),
          totalDocuments: allDocs.length,
          availableIds: allDocs.map(d => d._id)
        }
      }, { status: 404 });
    }

    console.log("Successfully deleted leave type");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE API error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      params: params
    });
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
