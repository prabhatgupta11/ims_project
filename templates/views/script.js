// // document.addEventListener("DOMContentLoaded", function() {
// //     const addProductBtn = document.getElementById("add-product-btn");
// //     const productList = document.getElementById("product-list");

// // const { JSON } = require("sequelize");

  
// //     addProductBtn.addEventListener("click", function() {
// //       const newRow = document.createElement("tr");
// //       newRow.innerHTML = `
// //         <td><select name="product" class="product-select">
// //             <option value="product1">Product 1</option>
// //             <option value="product2">Product 2</option>
// //             <option value="product3">Product 3</option>
// //         </select></td>
// //         <td><input type="number" name="quantity" class="quantity-input" value="1"></td>
// //         <td><input type="number" name="price" class="price-input"></td>
// //         <td><input type="number" name="discount" class="discount-input"></td>
// //         <td class="total-cell" name="total">0</td>
// //         <td><i class="fa-solid fa-trash delete-row-btn"></i></td>
// //       `;
   
// //       productList.appendChild(newRow);
  
// //       setupRowListeners(newRow);
// //       updateTotal();
// //     });
  
// //     function setupRowListeners(row) {
// //       const productSelect = row.querySelector(".product-select");
// //       const quantityInput = row.querySelector(".quantity-input");
// //       const priceInput = row.querySelector(".price-input");
// //       const discountInput = row.querySelector(".discount-input");
// //       const deleteBtn = row.querySelector(".delete-row-btn");
  
// //       productSelect.addEventListener("change", updateTotal);
// //       quantityInput.addEventListener("input", updateTotal);
// //       priceInput.addEventListener("input", updateTotal);
// //       discountInput.addEventListener("input", updateTotal);
// //       deleteBtn.addEventListener("click", function() {
        
// //         row.remove()
       
// //         updateTotal();
// //       });
// //     }
  
// //     function updateTotal() {
// //       const rows = productList.querySelectorAll("tr");
// //       rows.forEach(row => {
// //         const quantity = parseFloat(row.querySelector(".quantity-input").value);
// //         const price = parseFloat(row.querySelector(".price-input").value);
// //         const discount = parseFloat(row.querySelector(".discount-input").value);
  
// //         const total = (quantity * price) - discount;
  
// //         row.querySelector(".total-cell").textContent = total.toFixed(2);
// //       });
// //     }
// //   });


//   document.addEventListener("DOMContentLoaded", function() {
//     const addProductBtn = document.getElementById("add-product-btn");
//     const productList = document.getElementById("product-list");
//     const selectproduct=document.getElementById("product")
      
//       let lsdata = JSON.parse(localStorage.getItem("select_value"));
//       console.log(lsdata)
// //   let val = lsdata[lsdata.length - 1];
// //   console.log("new", val);


//     selectproduct.addEventListener("change",(e)=>{
//         // console.log(e.target.value)
//         localStorage.setItem("select_value",JSON.stringify(e.target.value))
//     })
  
//     addProductBtn.addEventListener("click", function() {
//         const newRow = document.createElement("tr");
//         newRow.innerHTML = `
//             <td><select name="product[]" class="product-select">
//                 <option value="product1">Product 1</option>
//                 <option value="product2">Product 2</option>
//                 <option value="product3">Product 3</option>
//             </select></td>
//             <td><input type="number" name="quantity[]" class="quantity-input" value="1"></td>
//             <td><input type="number" name="price[]" class="price-input"></td>
//             <td><input type="number" name="discount[]" class="discount-input"></td>
//             <td class="total-cell" name="total">0</td>
//             <td><i class="fa-solid fa-trash delete-row-btn"></i></td>
//         `;
   
//         productList.appendChild(newRow);
  
//         setupRowListeners(newRow);
//         updateTotal();
//     });
  
//     function setupRowListeners(row) {
//         const productSelect = row.querySelector(".product-select");
//         const quantityInput = row.querySelector(".quantity-input");
//         const priceInput = row.querySelector(".price-input");
//         const discountInput = row.querySelector(".discount-input");
//         const deleteBtn = row.querySelector(".delete-row-btn");
  
//         productSelect.addEventListener("change", updateTotal);
//         quantityInput.addEventListener("input", updateTotal);
//         priceInput.addEventListener("input", updateTotal);
//         discountInput.addEventListener("input", updateTotal);
//         deleteBtn.addEventListener("click", function() {
//             row.remove();
//             updateTotal();
//         });
//     }
  
//     function updateTotal() {
//         const rows = productList.querySelectorAll("tr");
//         let grandTotal = 0;
  
//         rows.forEach(row => {
//             const quantity = parseFloat(row.querySelector(".quantity-input").value);
//             const price = parseFloat(row.querySelector(".price-input").value);
//             const discount = parseFloat(row.querySelector(".discount-input").value);
  
//             const total = (quantity * price) - discount;
//             row.querySelector(".total-cell").textContent = total.toFixed(2);
  
//             grandTotal += total;
//         });
  
//         // You can update the grand total wherever you want to display it
//         // For example:
//         // const grandTotalElement = document.getElementById("grand-total");
//         // grandTotalElement.textContent = grandTotal.toFixed(2);
//     }
//   });
  