import mongoose from "mongoose";
import bookSchema from "./bookModel";
import borrowSchema from "./borrowModel";
import categorySchema from "./categoryModel";
import userSchema from "./userModel";

async function main() {
  await mongoose.connect("mongodb+srv://lumao0531:maoxueyi0531@cluster0.sroyt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
}

main()
  .then((res) => {
    console.log("mongo connected success");
  })
  .catch(() => {
    console.log("mongo connected fail");
  });

const Book = mongoose.model("Book", bookSchema);
const User = mongoose.model("User", userSchema);
const Category = mongoose.model("Category", categorySchema);
const Borrow = mongoose.model("Borrow", borrowSchema);

export { Borrow, Book, User, Category };
