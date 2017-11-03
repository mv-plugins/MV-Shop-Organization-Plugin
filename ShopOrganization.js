/*:
 * @plugindesc v1.1 Organizes the Buy window of the shop in different categories.
 * @author FeelZoR
 * 
 * @param Categories
 * @desc The list of Categories. Separate each category with a ';'.
 * Leave blank to use no category.
 * 
 * @param Default Category
 * @desc The default category if the item has no data. Leave blank to use first category.
 * 
 * @param Maximum Categories on One Line
 * @desc Sets the maximum number of categories shown at once, in the shop.
 * @default 4
 * 
 * @help ===================== Shop Organization v1.0 by FeelZoR =====================
 * Free to use for any project - Commercial or Non-Commercial.
 * No Credits required, but highly appreciated.
 * 
 * -----------------------------
 * 
 * Define all your categories in the "Categories" parameter.
 * If the items have no category defined, they will go into the category defined in
 * the "Default Category".
 * If left to blank, the default category is the first one.
 * To put an item in a category, open the Database and put in the notes
 * <shop_category:NameOfTheCategory> somewhere.
 * 
 * The name of the plugin MUST BE ShopOrganization. If it isn't, rename the plugin
 * file to "ShopOrganization.js".
 */
 
parameters = PluginManager.parameters('ShopOrganization');
FLZ_Shop_Categories = String(parameters['Categories'] || '').split(';');
FLZ_Default_Category = String(parameters['Default Category'] || FLZ_Shop_Categories[0] || '');
FLZ_Max_Number_Categories_One_Line = Number(parameters['Maximum Categories on One Line'] || 4);

if (FLZ_Shop_Categories != '') { 

//-----------------------------------------------------------------------------
// Scene_Shop
//
// The scene class of the shop screen.

FLZ_ShopOrganization_Old_SceneShop_Create = Scene_Shop.prototype.create;
Scene_Shop.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createHelpWindow();
    this.createGoldWindow();
    this.createCommandWindow();
    this.createDummyWindow();
	this.createBuyCategoryWindow();
    this.createNumberWindow();
    this.createStatusWindow();
    this.createBuyWindow();
    this.createCategoryWindow();
    this.createSellWindow();
};

Scene_Shop.prototype.createBuyCategoryWindow = function() {
    this._buyCategoryWindow = new Window_BuyItemCategory();
    this._buyCategoryWindow.setHelpWindow(this._helpWindow);
    this._buyCategoryWindow.y = this._dummyWindow.y;
    this._buyCategoryWindow.hide();
    this._buyCategoryWindow.deactivate();
    this._buyCategoryWindow.setHandler('ok',     this.onBuyCategoryOk.bind(this));
    this._buyCategoryWindow.setHandler('cancel', this.onBuyCategoryCancel.bind(this));
    this.addWindow(this._buyCategoryWindow);
};

Scene_Shop.prototype.createBuyWindow = function() {
    var wy = this._dummyWindow.y + this._buyCategoryWindow.height;
    var wh = this._dummyWindow.height - this._buyCategoryWindow.height;
    this._buyWindow = new Window_ShopBuy(0, wy, wh, this._goods);
    this._buyWindow.setHelpWindow(this._helpWindow);
    this._buyWindow.setStatusWindow(this._statusWindow);
    this._buyWindow.hide();
    this._buyWindow.setHandler('ok',     this.onBuyOk.bind(this));
    this._buyWindow.setHandler('cancel', this.onBuyCancel.bind(this));
	this._buyCategoryWindow.setItemWindow(this._buyWindow);
    this.addWindow(this._buyWindow);
};

Scene_Shop.prototype.createNumberWindow = function() {
    var wy = this._dummyWindow.y + this._buyCategoryWindow.height;
    var wh = this._dummyWindow.height - this._buyCategoryWindow.height;
    this._numberWindow = new Window_ShopNumber(0, wy, wh);
    this._numberWindow.hide();
    this._numberWindow.setHandler('ok',     this.onNumberOk.bind(this));
    this._numberWindow.setHandler('cancel', this.onNumberCancel.bind(this));
    this.addWindow(this._numberWindow);
};

Scene_Shop.prototype.createStatusWindow = function() {
    var wx = this._numberWindow.width;
    var wy = this._dummyWindow.y + this._buyCategoryWindow.height;
    var ww = Graphics.boxWidth - wx;
    var wh = this._dummyWindow.height - this._buyCategoryWindow.height;
    this._statusWindow = new Window_ShopStatus(wx, wy, ww, wh);
    this._statusWindow.hide();
    this.addWindow(this._statusWindow);
};

FLZ_ShopOrganization_Old_SceneShop_CommandBuy = Scene_Shop.prototype.commandBuy;
Scene_Shop.prototype.commandBuy = function() {
	FLZ_ShopOrganization_Old_SceneShop_CommandBuy.call(this);
    this._buyCategoryWindow.show();
    this._buyCategoryWindow.activate();
	this._buyWindow.deselect();
	this._buyWindow.deactivate();
	this._buyWindow.refresh();
};

FLZ_ShopOrganization_Old_SceneShop_SellOk = Scene_Shop.prototype.onSellOk;
Scene_Shop.prototype.onSellOk = function() {
	FLZ_ShopOrganization_Old_SceneShop_SellOk.call(this);	
    this._categoryWindow.show();
};

Scene_Shop.prototype.onBuyCancel = function() {
	this._buyWindow.deselect();
    this._buyCategoryWindow.activate();
    this._statusWindow.setItem(null);
    this._helpWindow.clear();
};

Scene_Shop.prototype.onBuyCategoryOk = function() {
	this.activateBuyWindow();
    this._buyWindow.select(0);
}

Scene_Shop.prototype.onBuyCategoryCancel = function() {
	this._commandWindow.activate();
    this._dummyWindow.show();
    this._buyCategoryWindow.hide();
    this._buyWindow.hide();
	this._statusWindow.hide();
}

//-----------------------------------------------------------------------------
// Window_BuyItemCategory
//
// The window for selecting a category of items on the buy shop screen.

function Window_BuyItemCategory() {
    this.initialize.apply(this, arguments);
}

Window_BuyItemCategory.prototype = Object.create(Window_HorzCommand.prototype);
Window_BuyItemCategory.prototype.constructor = Window_BuyItemCategory;

Window_BuyItemCategory.prototype.initialize = function() {
    Window_HorzCommand.prototype.initialize.call(this, 0, 0);
};

Window_BuyItemCategory.prototype.windowWidth = function() {
    return Graphics.boxWidth;
};

Window_BuyItemCategory.prototype.maxCols = function() {
    return Math.min(FLZ_Max_Number_Categories_One_Line, FLZ_Shop_Categories.length);
};

Window_BuyItemCategory.prototype.update = function() {
    Window_HorzCommand.prototype.update.call(this);
    if (this._itemWindow) {
        this._itemWindow.setCategory(this.currentSymbol());
    }
};

Window_BuyItemCategory.prototype.makeCommandList = function() {
	for (category in FLZ_Shop_Categories) {
		this.addCommand(FLZ_Shop_Categories[category], FLZ_Shop_Categories[category]);
	}
};

Window_BuyItemCategory.prototype.drawItem = function(index) {
    var rect = this.itemRectForText(index);
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.drawTextEx(this.commandName(index), rect.x, rect.y);
}

Window_BuyItemCategory.prototype.setItemWindow = function(itemWindow) {
    this._itemWindow = itemWindow;
    this.update();
};

//-----------------------------------------------------------------------------
// Window_ShopBuy
//
// The window for selecting an item to buy on the shop screen.

FLZ_ShopOrganization_Old_WindowShopBuy_Initialize = Window_ShopBuy.prototype.initialize;
Window_ShopBuy.prototype.initialize = function(x, y, height, shopGoods) {
	FLZ_ShopOrganization_Old_WindowShopBuy_Initialize.call(this, x, y, height, shopGoods);
    this._category = 'none';
};

Window_ShopBuy.prototype.setCategory = function(category) {
    if (this._category !== category) {
        this._category = category;
        this.refresh();
        this.resetScroll();
    }
};

Window_ShopBuy.prototype.makeItemList = function() {
    this._data = [];
    this._price = [];
    this._shopGoods.forEach(function(goods) {
        var item = null;
        switch (goods[0]) {
        case 0:
            item = $dataItems[goods[1]];
            break;
        case 1:
            item = $dataWeapons[goods[1]];
            break;
        case 2:
            item = $dataArmors[goods[1]];
            break;
        }
		
		var item_category = String(item.meta.shop_category || FLZ_Default_Category);
		
        if (item_category === this._category) {
            this._data.push(item);
            this._price.push(goods[2] === 0 ? item.price : goods[3]);
        }
    }, this);
};

} // endif