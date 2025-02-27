import express, { Request, Response } from "express";

// ==== Type Definitions, feel free to add or modify ==========================
interface cookbookEntry {
  name: string;
  type: string;
}

interface requiredItem {
  name: string;
  quantity: number;
}

interface recipe extends cookbookEntry {
  requiredItems: requiredItem[];
}

interface ingredient extends cookbookEntry {
  cookTime: number;
}

interface recipeSummary {
  name: string;
  cookTime: number;
  ingredients: requiredItem[];
}

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
const cookbook: Map<string, recipe | ingredient> = new Map();

// Task 1 helper (don't touch)
app.post("/parse", (req:Request, res:Response) => {
  const { input } = req.body;

  const parsed_string = parse_handwriting(input)
  if (parsed_string == null) {
    res.status(400).send("this string is cooked");
    return;
  } 
  res.json({ msg: parsed_string });
  return;
  
});

// [TASK 1] ====================================================================
// Takes in a recipeName and returns it in a form that 
const parse_handwriting = (recipeName: string): string | null => {
  // Remove invalid characters
  recipeName = recipeName.replace(/[-_]/g, ' ');
  recipeName = recipeName.replace(/[^A-Za-z ]/g, '');
  
  recipeName = recipeName.toLowerCase();
  // Remove duplicate and trailing whitespace
  let recipeNameSplit = recipeName.split(/\s+/g).filter(str => str !== '');
  // Capitalise first letter of each word
  recipeNameSplit = recipeNameSplit.map(
    str => str.charAt(0).toUpperCase() + str.slice(1)
  );

  if (recipeNameSplit.length > 0) {
    return recipeNameSplit.join(' ');
  } else {
    return null;
  }
}

// [TASK 2] ====================================================================
// Endpoint that adds a CookbookEntry to your magical cookbook
app.post("/entry", (req:Request, res:Response) => {
  const entry = req.body;

  if (cookbook.has(entry.name as string)) {
    res.status(400).send('entry with this name already exists');
  }

  switch (entry.type as string) {
    case 'recipe':
      let recipeObj = entry as recipe;

      // Check for duplicates in requiredItems
      const requiredItemsNames = recipeObj.requiredItems.map(obj => obj.name);
      if (requiredItemsNames.length !== new Set(requiredItemsNames).size) {
        res.status(400).send('duplicate items in requiredItems');
      }
      cookbook.set(recipeObj.name, recipeObj);
      res.json({ });

    case 'ingredient':
      let ingredientObj = entry as ingredient;
      if (ingredientObj.cookTime < 0) {
        res.status(400).send('invalid cookTime');
      }
      cookbook.set(ingredientObj.name, ingredientObj);
      res.json({ });
    
    default:
      res.status(400).send('invalid type');
  }
});

// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req:Request, res:Request) => {
  const { name } = req.query;
  if (!cookbook.has(name)) {
    res.status(400).send('recipe with that name not found');
  }
  if (cookbook.get(name).type !== 'recipe') {
    res.status(400).send('searched item is not a recipe');
  }

  try {
    const recipe = getRecipeSummary(name, 1);
    // Merge duplicate ingredients in list
    let mergedIngredientsList: requiredItem[] = [];
    for (const ingredient of recipe.ingredients) {
      const existingIngredient = mergedIngredientsList.find(
        (item) => item.name === ingredient.name
      );

      if (existingIngredient) {
        existingIngredient.quantity += ingredient.quantity;
      } else {
        mergedIngredientsList.push({ ...ingredient });
      }
    }
    
    res.json(recipe);
  }
  catch (err) {
    res.status(400).send(err.message);
  }
});

// Helper function to help recursively get recipe summaries
const getRecipeSummary = (name: string, recipeQuantity: number): recipeSummary => {
  let cookTime = 0;
  const ingredients: requiredItem[] = [];

  const recipeEntry = cookbook.get(name) as recipe;
  if (!recipeEntry) {
    throw new Error('recipe contains ingredients not in cookbook')
  }

  // Loop through ingredients/recipes required for the recipe
  for (const ingredientItem of recipeEntry.requiredItems) {
    const ingredientEntry = cookbook.get(ingredientItem.name);
    const totalIngredientQuantity = ingredientItem.quantity * recipeQuantity;

    if (ingredientEntry.type === 'ingredient') {
      ingredients.push({ 
        name: ingredientEntry.name,
        quantity: totalIngredientQuantity
      })
      cookTime += (ingredientEntry as ingredient).cookTime * totalIngredientQuantity;
    }
    else {
      // Recursively get the ingredients for the sub-recipe
      const subRecipe = getRecipeSummary(ingredientItem.name, totalIngredientQuantity);
      // Merge into the main ingredients list for the main recipe
      ingredients.push.apply(ingredients, subRecipe.ingredients);
      cookTime += subRecipe.cookTime;
    }
  }
  
  return {
    name, cookTime, ingredients
  }
}

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
