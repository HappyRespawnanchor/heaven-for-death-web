//=============================================================================
// AndrewX - Wall Passage
// AndrewX_WallPassage.js
//=============================================================================
var AndrewX = AndrewX || {};
AndrewX.WP = AndrewX.WP || {};
//=============================================================================
/*:
 * @plugindesc v0.71 Enable characters to walk behind walls. 
 * Also enable tiles in set A to be star passage.
 * @author AndrewX
 *
 * @param Wall Top Terrain Tag
 * @desc Tiles with this Terrain Tag will be calculated as wall top side. 
 * Use a number greater than 7 (e.g. 99) if you do not wish to make use of this property.
 * @default 7
 *
 * @param Wall Front Terrain Tag
 * @desc Tiles with this Terrain Tag will be calculated as wall front side.
 * Use a number greater than 7 (e.g. 99) if you do not wish to make use of this property.
 * @default 6
 * 
 * @param Default Wall Height
 * @desc If wall front side cannot be sampled, this will be the default wall height.
 * Use 0 if you do not wish to make use of this property.
 * @default 2
 *
 * @param Default Wall Thickness
 * @desc If wall top side cannot be sampled, this will be the default wall thickness.
 * Use 0 if you do not wish to make use of this property. (disabled by default)
 * @default 0
 *
 * @param Star Terrain Tag
 * @desc Tiles with this Terrain Tag will be set to star passage(shown above characters).
 * Use a number greater than 7 (e.g. 99) if you do not wish to make use of this property.
 * @default 99
 *
 * @param Star Region ID List
 * @desc Tiles with listed Region ID will be set to star passage. Separate multiple ID with commas.
 * Use 0 if you do not wish to make use of this property.
 * @default 0
 * 
 * @help
 * ============================================================================
 * Introduction and Instructions
 * ============================================================================
 *
 * It's a pity multi-layered mapping is canceled since RMVX, and characters are 
 * no longer able to walk behind walls, which makes maps a bit of weird. With 
 * this plugin, you can set two terrain tags as wall top and wall front, and 
 * passage behind walls are calculated automatically. It is best if you use 
 * this feature on autotiles in set A.
 *
 * You can also set a terrain tag as Star Terrain Tag, which makes tiles to be
 * star passage (even they are in set A).
 *
 * Or you can set a list of region IDs as Star Region ID. Tiles with these IDs
 * will be star passage. I recommend using this feature together with Yanfly's
 * Region Restrictions plugin to block unwanted passage.
 *
 * To disable certain function, set parameter as following:
 * Wall Top Terrain Tag: a number greater than 7 (e.g. 99)
 * Wall Front Terrain Tag: a number greater than 7 (e.g. 99)
 * Default Wall Height: set to 0
 * Default Wall Thickness: set to 0 (disabled by default)
 * Star Terrain Tag: a number greater than 7 (e.g. 99)
 * Star Region ID List: set to 0
 *
 * Note: 
 * - 4-direction passage does not work on tiles with above tags/region id.
 * - Events in higher layer of wall need to be set to above characters priority 
 *   in order to be displayed above the wall.
 *
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 0.71:
 * - Modified: Improved passage check logic
 * - Modified: Improved layer check logic
 * 
 * Version 0.70:
 * - New: Can use multiple star region IDs
 * - Modified: Minor bug fix
 * 
 * Version 0.60:
 * - Modified: Improved passage check logic
 * 
 * Version 0.51:
 * - Modified: Optimized logic for passage and higher layer check
 * - Modified: Disabled default wall thickness by default
 * 
 * Version 0.50:
 * - New: Star region ID can be used now
 * - New: Higher and lower layers of wall tile are calculated automatically now
 * - New: B~E tiles can be displayed above walls. So no need to modify 
 *   additional star passage
 * - Modified: Rearrange the order of parameters
 * 
 * Version 0.01:
 * - Finished prototype
 *
 * ============================================================================
 * Term of Use
 * ============================================================================
 *
 * Free for use in non-commercial or commercial RMMV projects
 * Please credit AndrewX
 * 
 */
//=============================================================================
 
//=============================================================================
// Parameter Variables
//=============================================================================
 
var parameters = PluginManager.parameters('AndrewX_WallPassage');
var starTag = Number(parameters['Star Terrain Tag']);
var starId = parameters['Star Region ID List'].split(",");
for (var i = 0; i < starId.length; i++) {
        starId[i] = Number(starId[i]);
};
var topTag = Number(parameters['Wall Top Terrain Tag']);
var frontTag = Number(parameters['Wall Front Terrain Tag']);
var defWallHeight = Number(parameters['Default Wall Height']);
var defWallThickness = Number(parameters['Default Wall Thickness']);
 
//=============================================================================
// Private tag check for game map, layer is specified
//=============================================================================
 
Game_Map.prototype._layerHasTag = function(x, y, l, t) {
        var flags = this.tilesetFlags();
        var tiles = this.allTiles(x, y);
        if (tiles[0] === 0 && tiles[1] === 0 && tiles[2] === 0 && tiles[3] === 0) {
                return false;
        }
        if (l === 0 || l === 1) {
                if ((flags[tiles[0]] & 0xF000) === (t << 12)) {
                        return true;
                } else if ((flags[tiles[1]] & 0xF000) === (t << 12)) {
                        return true;
                }
                return false;
        } else {
                if ((flags[tiles[2]] & 0xF000) === (t << 12)) {
                        return true;
                } else if ((flags[tiles[3]] & 0xF000) === (t << 12)) {
                        return true;
                }
                return false;
        }
};
 
//=============================================================================
// Private tag check for game map, all layers wiil be checked
//=============================================================================
 
Game_Map.prototype._allHasTag = function(x, y, t) {
        var flags = this.tilesetFlags();
        var tiles = this.allTiles(x, y);
        if (tiles[0] === 0 && tiles[1] === 0 && tiles[2] === 0 && tiles[3] === 0) {
                return false;
        }
        for (var i = 0; i < tiles.length; i++) {
                if ((flags[tiles[i]] & 0xF000) === (t << 12)) {
                        return true;
                }
        }
        return false;
};
 
//=============================================================================
// Modified passage check
//=============================================================================
 
AndrewX.WP.checkPassage = Game_Map.prototype.checkPassage;
Game_Map.prototype.checkPassage = function(x, y, bit) {
        var flags = this.tilesetFlags();
        var tiles = this.allTiles(x, y);
        var mapHeight = $dataMap.height;
        var upperTop = 0;
        var upperFront = 0;
        var lowerTop = 0;
        var lowerFront = 0;
        if ($gameMap.regionId(x, y) && starId.contains($gameMap.regionId(x, y))) {
                return true;
        }
        if (!(this._allHasTag(x, y, topTag) || this._allHasTag(x, y, frontTag))) {
                return AndrewX.WP.checkPassage.call(this, x, y, bit);
        }
        for (var i = tiles.length - 1; i >= 0; i--) {
                if (this._layerHasTag(x, y, i, starTag)) {
                        return true;
                } else if (this._layerHasTag(x, y, i, frontTag)) {
                        var j = 1;
                        while (y + j < mapHeight && this._layerHasTag(x, y + j, i, frontTag)) {
                                lowerFront++;
                                j++;
                        }
                        j = 1;
                        while (y - j >= 0 && this._layerHasTag(x, y - j, i, frontTag)) {
                                upperFront++;
                                j++;
                        }
                        while (y - j >= 0 && this._allHasTag(x, y - j, topTag)) {
                                upperTop++;
                                j++;
                        }
                        if (upperTop === 0) {
                                if (defWallThickness == 0 || lowerFront + 1 <= defWallThickness) {
                                        return false;
                                } else {
                                        return true;
                                }
                        } else if (lowerFront + 1 <= upperTop) {
                                return false;
                        } else {
                                return true;
                        }
                } else if (this._layerHasTag(x, y, i, topTag)) {
                        var j = 1;
                        while (y - j >= 0 && this._layerHasTag(x, y - j, i, topTag)) {
                                upperTop++;
                                j++;
                        }
                        j = 1;
                        while (y + j < mapHeight && this._layerHasTag(x, y + j, i, topTag)) {
                                lowerTop++;
                                j++;
                        }
                        while (y + j < mapHeight && this._allHasTag(x, y + j, frontTag)) {
                                lowerFront++;
                                j++;
                        }
                        if (lowerFront === 0) {
                                if (upperTop + 1 <= defWallHeight) {
                                        return true;
                                } else {
                                        return false;
                                }
                        } else if (upperTop + 1 <= lowerFront) {
                                return true;
                        } else {
                                return false;
                        }
                } else {
                        if ((flags[tiles[i]] & bit) === bit)
                                return false;
                }
 
        }
 
};
 
//=============================================================================
// Private tag check for tilemap
//=============================================================================
 
Tilemap.prototype._tileHasTag = function(x, y, t) {
        for (var i = 0; i < 4; i++) {
                var tileId = this._readMapData(x, y, i);
                if ((this.flags[tileId] & 0xF000) === (t << 12)) {
                        return true;
                }
        }
        return false;
};
 
//=============================================================================
// Private new higher tile check
//=============================================================================
 
Tilemap.prototype._isHigherTileNew = function(x, y) {
        var mapHeight = this._mapHeight;
        var upperTop = 0;
        var upperFront = 0;
        var lowerTop = 0;
        var lowerFront = 0;
        if ($gameMap.regionId(x, y) && starId.contains($gameMap.regionId(x, y))) {
                return true;
        } else if (this._tileHasTag(x, y, starTag)) {
                return true;
        } else if (this._tileHasTag(x, y, frontTag)) {
                var i = 1;
                while (y + i < mapHeight && this._tileHasTag(x, y + i, frontTag)) {
                        lowerFront++;
                        i++;
                }
                i = 1;
                while (y - i >= 0 && this._tileHasTag(x, y - i, frontTag)) {
                        upperFront++;
                        i++;
                }
                while (y - i >= 0 && this._tileHasTag(x, y - i, topTag)) {
                        upperTop++;
                        i++;
                }
                if (upperTop === 0) {
                        if (defWallThickness == 0 || lowerFront + 1 <= defWallThickness) {
                                return false;
                        } else {
                                return true;
                        }
                } else if (lowerFront + 1 <= upperTop) {
                        return false;
                } else {
                        return true;
                }
        } else if (this._tileHasTag(x, y, topTag)) {
                var i = 1;
                while (y - i >= 0 && this._tileHasTag(x, y - i, topTag)) {
                        upperTop++;
                        i++;
                }
                i = 1;
                while (y + i < mapHeight && this._tileHasTag(x, y + i, topTag)) {
                        lowerTop++;
                        i++;
                }
                while (y + i < mapHeight && this._tileHasTag(x, y + i, frontTag)) {
                        lowerFront++;
                        i++;
                }
                if (lowerFront === 0) {
                        if (upperTop + 1 <= defWallHeight) {
                                return true;
                        } else {
                                return false;
                        }
                } else if (upperTop + 1 <= lowerFront) {
                        return true;
                } else {
                        return false;
                }
        } else {
                return false;
        }
};
 
//=============================================================================
// Modified _paintTiles
//=============================================================================
 
AndrewX.WP._paintTiles = Tilemap.prototype._paintTiles;
Tilemap.prototype._paintTiles = function(startX, startY, x, y) {
        if (($gameMap.regionId(startX + x, startY + y) &&
                        starId.contains($gameMap.regionId(startX + x, startY + y))) ||
                this._tileHasTag(startX + x, startY + y, starTag) ||
                this._tileHasTag(startX + x, startY + y, topTag) ||
                this._tileHasTag(startX + x, startY + y, frontTag)) {
                var tableEdgeVirtualId = 10000;
                var mx = startX + x;
                var my = startY + y;
                var dx = (mx * this._tileWidth).mod(this._layerWidth);
                var dy = (my * this._tileHeight).mod(this._layerHeight);
                var lx = dx / this._tileWidth;
                var ly = dy / this._tileHeight;
                var tileId0 = this._readMapData(mx, my, 0);
                var tileId1 = this._readMapData(mx, my, 1);
                var tileId2 = this._readMapData(mx, my, 2);
                var tileId3 = this._readMapData(mx, my, 3);
                var shadowBits = this._readMapData(mx, my, 4);
                var upperTileId1 = this._readMapData(mx, my - 1, 1);
                var lowerTiles = [];
                var upperTiles = [];
 
                var isHigher = this._isHigherTileNew(mx, my);
 
                if (($gameMap.regionId(startX + x, startY + y) &&
                                starId.contains($gameMap.regionId(startX + x, startY + y))) ||
                        (this.flags[tileId0] & 0xF000) === (starTag << 12) ||
                        (this.flags[tileId0] & 0xF000) === (topTag << 12) ||
                        (this.flags[tileId0] & 0xF000) === (frontTag << 12)) {
                        if (isHigher) {
                                upperTiles.push(tileId0);
                        } else {
                                lowerTiles.push(tileId0);
                        }
                } else {
                        if (this._isHigherTile(tileId0)) {
                                upperTiles.push(tileId0);
                        } else {
                                lowerTiles.push(tileId0);
                        }
                }
 
                if (($gameMap.regionId(startX + x, startY + y) &&
                                starId.contains($gameMap.regionId(startX + x, startY + y))) ||
                        (this.flags[tileId1] & 0xF000) === (starTag << 12) ||
                        (this.flags[tileId1] & 0xF000) === (topTag << 12) ||
                        (this.flags[tileId1] & 0xF000) === (frontTag << 12)) {
                        if (isHigher) {
                                upperTiles.push(tileId1);
                        } else {
                                lowerTiles.push(tileId1);
                        }
                } else {
                        if (this._isHigherTile(tileId1)) {
                                upperTiles.push(tileId1);
                        } else {
                                lowerTiles.push(tileId1);
                        }
                }
 
                lowerTiles.push(-shadowBits);
 
                if (this._isTableTile(upperTileId1) && !this._isTableTile(tileId1)) {
                        if (!Tilemap.isShadowingTile(tileId0)) {
                                lowerTiles.push(tableEdgeVirtualId + upperTileId1);
                        }
                }
 
                if (this._isOverpassPosition(mx, my)) {
                        upperTiles.push(tileId2);
                        upperTiles.push(tileId3);
                } else {
                        if (isHigher) {
                                upperTiles.push(tileId2);
                        } else {
                                lowerTiles.push(tileId2);
                        }
                        if (isHigher) {
                                upperTiles.push(tileId3);
                        } else {
                                lowerTiles.push(tileId3);
                        }
                }
 
                var count = 1000 + this.animationCount - my;
                var frameUpdated = (count % 30 === 0);
                this._animationFrame = Math.floor(count / 30);
 
                var lastLowerTiles = this._readLastTiles(0, lx, ly);
                if (!lowerTiles.equals(lastLowerTiles) ||
                        (Tilemap.isTileA1(tileId0) && frameUpdated)) {
                        this._lowerBitmap.clearRect(dx, dy, this._tileWidth, this._tileHeight);
                        for (var i = 0; i < lowerTiles.length; i++) {
                                var lowerTileId = lowerTiles[i];
                                if (lowerTileId < 0) {
                                        this._drawShadow(this._lowerBitmap, shadowBits, dx, dy);
                                } else if (lowerTileId >= tableEdgeVirtualId) {
                                        this._drawTableEdge(this._lowerBitmap, upperTileId1, dx, dy);
                                } else {
                                        this._drawTile(this._lowerBitmap, lowerTileId, dx, dy);
                                }
                        }
                        this._writeLastTiles(0, lx, ly, lowerTiles);
                }
 
                var lastUpperTiles = this._readLastTiles(1, lx, ly);
                if (!upperTiles.equals(lastUpperTiles)) {
                        this._upperBitmap.clearRect(dx, dy, this._tileWidth, this._tileHeight);
                        for (var j = 0; j < upperTiles.length; j++) {
                                this._drawTile(this._upperBitmap, upperTiles[j], dx, dy);
                        }
                        this._writeLastTiles(1, lx, ly, upperTiles);
                }
        } else {
                AndrewX.WP._paintTiles.call(this, startX, startY, x, y);
        }
};
