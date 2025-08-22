const themeToggle = document.querySelector('.theme-toggle'); 
const promptBtn=document.querySelector(".prompt-btn");
const promptInput= document.querySelector(".prompt-input");
const promptForm=document.querySelector(".prompt-form");
const modelSelect=document.getElementById("model-select");
const ratioSelect=document.getElementById("ratio-select");
const countSelect=document.getElementById("count-select");
const gridGallery=document.querySelector(".gallery-grid");
const generateBtn=document.querySelector(".generate-btn");
const API_KEY=""; // Free Hugging Face API key

const examplePrompts =[
  "A surreal landscape made of floating glass cubes under a neon sky",
  "Abstract painting of sound waves in vibrant rainbow colors",
  "A city skyline melting like candle wax into the ocean",
  "A fractal forest glowing with bioluminescent patterns",
  "A portrait where half the face is human and half is mechanical gears",
  "A cinematic shot of a rainy Tokyo street at night, neon reflections on the ground",
  "A dragon sleeping inside a crystal cave lit by glowing mushrooms",
  "A futuristic cyberpunk city with flying cars and holograms",
  "A medieval castle floating in the sky, held up by giant chains",
  "A cat wearing a tiny astronaut suit floating in space"
];

//set theme
(()=>{
 const savedTheme=localStorage.getItem("theme");
 const systemPrefersDark = window.matchMedia("(prefers-color-scheme:dark)").matches;
 const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
 document.body.classList.toggle("dark-theme",isDarkTheme);
 themeToggle.querySelector("i").className=isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();

const toggleTheme=()=>{ 
 const isDarkTheme=document.body.classList.toggle("dark-theme");
 themeToggle.querySelector("i").className=isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
};
 
const getImageDimensions=(aspectRatio,baseSize=512)=>{
 const [w,h]=aspectRatio.split("/").map(Number);
 const scaleFactor=baseSize/Math.sqrt(w*h);
 let width=Math.round(w*scaleFactor);
 let height=Math.round(h*scaleFactor);
 width = Math.max(Math.round(width/16)*16, 256);
 height = Math.max(Math.round(height/16)*16, 256);
 return {width,height};
}

const updateImageCard=(imgIndex,imgUrl)=>{
 const imgCard=document.getElementById(`img-card-${imgIndex}`);
 if(!imgCard) return;
 imgCard.classList.remove("loading");
 imgCard.innerHTML=`<img src="${imgUrl}" class="result-img" />
   <div class="img-overlay">
     <a href="${imgUrl}" class="img-download-btn" download="${Date.now()}.png">
       <i class="fa-solid fa-download"></i>
     </a>
   </div>`;
};

const generateImage=async (selectedModel,imageCount,aspectRatio,promptText)=>{ 
 const MODEL_URL=`https://api-inference.huggingface.co/models/${selectedModel}`;
 const {width,height}=getImageDimensions(aspectRatio);
 generateBtn.setAttribute("disabled","true");

 const imagePromises=Array.from({length:imageCount}, async(_,i)=>{
   try{
     const response=await fetch(MODEL_URL, {
       headers: {
         Authorization: `Bearer ${API_KEY}`,
         "Content-Type": "application/json",
       },
       method:"POST",
       body:JSON.stringify({
         inputs: promptText,
         parameters:{width,height},
         options:{wait_for_model:true}
       }),
     });

     if(!response.ok) throw new Error((await response.json())?.error || "Request failed");

     const arrayBuffer=await response.arrayBuffer();
     const blob=new Blob([arrayBuffer]);
     updateImageCard(i,URL.createObjectURL(blob));

   }catch(err){
     console.error(err);
     const imgCard=document.getElementById(`img-card-${i}`);
     imgCard.classList.replace("loading","error");
     imgCard.querySelector(".status-text").textContent="Generation failed!";
   }
 });
 await Promise.allSettled(imagePromises);
 generateBtn.removeAttribute("disabled");
};

const creatImageCards=(selectedModel,imageCount,aspectRatio,promptText)=>{
 gridGallery.innerHTML="";
 for(let i=0;i<imageCount;i++){
   gridGallery.innerHTML+=`
     <div class="img-card loading" id="img-card-${i}" style="aspect-ratio:${aspectRatio}">
       <div class="status-container">
         <div class="spinner"></div>
         <i class="fa-solid fa-triangle-exclamation"></i>
         <p class="status-text">Generating...</p>
       </div>
     </div>`;
 }
 generateImage(selectedModel,imageCount,aspectRatio,promptText);
};

const handleFormSubmit=(e)=>{
 e.preventDefault();
 const selectedModel=modelSelect.value;
 const imageCount=parseInt(countSelect.value)||1;
 const aspectRatio=ratioSelect.value||"1/1";
 const promptText=promptInput.value.trim();
 creatImageCards(selectedModel,imageCount,aspectRatio,promptText); 
};

promptBtn.addEventListener("click",()=>{
 const prompt=examplePrompts[Math.floor(Math.random()*examplePrompts.length)];
 promptInput.value=prompt;
 promptInput.focus();
});
promptForm.addEventListener("submit",handleFormSubmit);
themeToggle.addEventListener("click",toggleTheme);
