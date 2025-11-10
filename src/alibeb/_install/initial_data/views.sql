

DROP VIEW IF EXISTS `qproddmnsxcprod`;
DROP VIEW IF EXISTS `qventasserviciomesa`;
DROP VIEW IF EXISTS `qlineasxcprod`;
DROP VIEW IF EXISTS `qproddmns`;
DROP VIEW IF EXISTS `qpartidasvariables`;
DROP VIEW IF EXISTS `qbarrasdmns`;
DROP VIEW IF EXISTS `qrydetallecorte`;


CREATE TABLE IF NOT EXISTS  `qventasserviciomesa` (
	`Sys_PK` INT(11) NOT NULL,
	`Sys_TimeStamp` DATETIME NOT NULL,
	`Sys_GUID` VARCHAR(1) NOT NULL COLLATE 'latin1_swedish_ci',
	`Sys_DTCreated` DATETIME NULL,
	`Sys_User` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`Sys_LastUser` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`Sys_Exported` TINYINT(1) NULL,
	`Sys_DTExported` DATETIME NULL,
	`Sys_Info` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`Auditado` TINYINT(1) NULL,
	`Contabilizado` TINYINT(1) NULL,
	`Descuento1` DECIMAL(18,8) NULL,
	`Descuento2` DECIMAL(18,8) NULL,
	`dmnsMesa` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`dmnsNota` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`dmnsPersonas` INT(11) NULL,
	`Documento` INT(11) NOT NULL,
	`DomicilioEntrega` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`Fecha` DATE NOT NULL,
	`FEmbarque` DATE NULL,
	`FEntrega` DATE NULL,
	`FLiquidacion` DATE NULL,
	`FormaPago` INT(11) NOT NULL,
	`FUltimoCobro` DATE NULL,
	`ImporteAdicional` DECIMAL(18,8) NULL,
	`Impuesto1` DECIMAL(18,8) NULL,
	`Impuesto2` DECIMAL(18,8) NULL,
	`Impuesto3` DECIMAL(18,8) NULL,
	`Impuesto4` DECIMAL(18,8) NULL,
	`Notas` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`Partida` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`PComision` FLOAT NULL,
	`Poliza` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`Referencia` VARCHAR(1) NOT NULL COLLATE 'latin1_swedish_ci',
	`StatusAdministrativo` INT(11) NULL,
	`StatusEntrega` INT(11) NULL,
	`StatusFacturacion` INT(11) NULL,
	`StatusFinanciero` INT(11) NULL,
	`Subtotal` DECIMAL(18,8) NULL,
	`TipoCambio` DECIMAL(18,8) NULL,
	`TipoDomicilio` INT(11) NULL,
	`txtGuia` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`Vencimiento` DATE NULL,
	`AplicadoA` INT(11) NULL,
	`IAgente` INT(11) NULL,
	`ICaja` INT(11) NULL,
	`ICConsumo` INT(11) NOT NULL,
	`ICliente` INT(11) NOT NULL,
	`ICorte` INT(11) NULL,
	`IDivisa` INT(11) NOT NULL,
	`IFolio` INT(11) NOT NULL,
	`IGuia` INT(11) NULL,
	`IMovCaja` INT(11) NULL,
	`IPorteador` INT(11) NULL,
	`IRepartidor` INT(11) NULL,
	`uf_Color` INT(11) NULL,
	`sys_recver` INT(11) NULL,
	`sys_deleted` BIT(1) NULL,
	`sys_lock` INT(11) NULL,
	`Total` DECIMAL(24,8) NULL
);
CREATE TABLE IF NOT EXISTS  `qproddmnsxcprod` (
	`Sys_PK` INT(11) NOT NULL,
	`Descripcion` VARCHAR(1) NOT NULL COLLATE 'latin1_swedish_ci',
	`Precio1` DECIMAL(18,8) NULL,
	`Precio2` DECIMAL(18,8) NULL,
	`Precio3` DECIMAL(18,8) NULL,
	`Precio4` DECIMAL(18,8) NULL,
	`Precio5` DECIMAL(18,8) NULL,
	`Color` INT(11) NULL,
	`Data1` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`VincularData` TINYINT(1) NULL,
	`IClase` INT(11) NOT NULL,
	`ITipo` INT(11) NOT NULL,
	`ILinea` INT(11) NOT NULL,
	`IDivisa` INT(11) NOT NULL,
	`TCambio` DECIMAL(18,8) NULL,
	`I1Venta` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`I2Venta` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`I3Venta` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`I4Venta` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`Nombre` VARCHAR(1) NOT NULL COLLATE 'latin1_swedish_ci',
	`Variables` BIGINT(21) NULL,
	`Lim2` DECIMAL(18,8) NULL,
	`Lim3` DECIMAL(18,8) NULL,
	`Lim4` DECIMAL(18,8) NULL,
	`Lim5` DECIMAL(18,8) NULL,
	`flagLimites` TINYINT(1) NULL,
	`Unidad` VARCHAR(1) NOT NULL COLLATE 'latin1_swedish_ci',
	`FactorB` FLOAT NOT NULL,
	`ICentrosProduccion` INT(11) NOT NULL
);
CREATE TABLE IF NOT EXISTS  `qlineasxcprod` (
	`Sys_PK` INT(11) NOT NULL,
	`Codigo` VARCHAR(1) NOT NULL COLLATE 'latin1_swedish_ci',
	`Descripcion` VARCHAR(1) NOT NULL COLLATE 'latin1_swedish_ci',
	`Color` INT(11) NULL,
	`ICProduccion` INT(11) NOT NULL,
	`Visible` TINYINT(1) NULL
);
CREATE TABLE IF NOT EXISTS  `qproddmnsxcprod` (
	`Sys_PK` INT(11) NOT NULL,
	`Descripcion` VARCHAR(1) NOT NULL COLLATE 'latin1_swedish_ci',
	`Precio1` DECIMAL(18,8) NULL,
	`Precio2` DECIMAL(18,8) NULL,
	`Precio3` DECIMAL(18,8) NULL,
	`Precio4` DECIMAL(18,8) NULL,
	`Precio5` DECIMAL(18,8) NULL,
	`Color` INT(11) NULL,
	`Data1` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`VincularData` TINYINT(1) NULL,
	`IClase` INT(11) NOT NULL,
	`ITipo` INT(11) NOT NULL,
	`ILinea` INT(11) NOT NULL,
	`IDivisa` INT(11) NOT NULL,
	`TCambio` DECIMAL(18,8) NULL,
	`I1Venta` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`I2Venta` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`I3Venta` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`I4Venta` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`Nombre` VARCHAR(1) NOT NULL COLLATE 'latin1_swedish_ci',
	`Variables` BIGINT(21) NULL,
	`Lim2` DECIMAL(18,8) NULL,
	`Lim3` DECIMAL(18,8) NULL,
	`Lim4` DECIMAL(18,8) NULL,
	`Lim5` DECIMAL(18,8) NULL,
	`flagLimites` TINYINT(1) NULL,
	`Unidad` VARCHAR(1) NOT NULL COLLATE 'latin1_swedish_ci',
	`FactorB` FLOAT NOT NULL,
	`ICentrosProduccion` INT(11) NOT NULL
);
CREATE TABLE IF NOT EXISTS  `qpartidasvariables` (
	`PKProducto` INT(11) NOT NULL,
	`Partidas` BIGINT(21) NOT NULL
);

CREATE TABLE IF NOT EXISTS  `qbarrasdmns` (
	`Sys_PK` INT(11) NOT NULL,
	`Nombre` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`Tipo` INT(11) NULL,
	`Opciones` TEXT NULL COLLATE 'latin1_swedish_ci',
	`AsignadoA` INT(11) NULL,
	`PKAsignadoA` INT(11) NULL
);
CREATE TABLE IF NOT EXISTS  `qrydetallecorte` (
	`Folio` INT(11) NOT NULL,
	`Fecha` DATE NOT NULL,
	`Hora` DATETIME NOT NULL,
	`Referencia` VARCHAR(1) NOT NULL COLLATE 'latin1_swedish_ci',
	`Categoria` VARCHAR(1) NOT NULL COLLATE 'latin1_swedish_ci',
	`Documento` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`Efectivo` DECIMAL(18,8) NULL,
	`Cheques` DECIMAL(18,8) NULL,
	`Tarjetas` DECIMAL(18,8) NULL,
	`Vales` DECIMAL(18,8) NULL,
	`Depositos` DECIMAL(18,8) NULL,
	`Divisa` VARCHAR(1) NOT NULL COLLATE 'latin1_swedish_ci',
	`Total` DECIMAL(22,8) NULL,
	`Notas` VARCHAR(1) NULL COLLATE 'latin1_swedish_ci',
	`ICorte` INT(11) NOT NULL,
	`ICaja` INT(11) NOT NULL
);
DROP TABLE IF EXISTS `qbarrasdmns`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `qbarrasdmns` AS select `dmnsbarra`.`Sys_PK` AS `Sys_PK`,`dmnsbarra`.`Nombre` AS `Nombre`,`dmnsbarra`.`Tipo` AS `Tipo`,`dmnsbarra`.`Opciones` AS `Opciones`,`dmnsasignbarra`.`Tipo` AS `AsignadoA`,`dmnsasignbarra`.`FK` AS `PKAsignadoA` from (`dmnsasignbarra` join `dmnsbarra` on((`dmnsasignbarra`.`FKBarra` = `dmnsbarra`.`Sys_PK`))) 
;

DROP TABLE IF EXISTS `qproddmns`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `qproddmns` AS select `producto`.`Sys_PK` AS `Sys_PK`,`producto`.`Descripcion` AS `Descripcion`,`producto`.`Precio1` AS `Precio1`,`producto`.`Precio2` AS `Precio2`,`producto`.`Precio3` AS `Precio3`,`producto`.`Precio4` AS `Precio4`,`producto`.`Precio5` AS `Precio5`,`producto`.`Color` AS `Color`,`producto`.`Data1` AS `Data1`,`producto`.`VincularData` AS `VincularData`,`producto`.`IClase` AS `IClase`,`producto`.`ITipo` AS `ITipo`,`producto`.`ILinea` AS `ILinea`,`producto`.`IDivisa` AS `IDivisa`,`divisa`.`TCambio` AS `TCambio`,`cfgimpuesto`.`I1Venta` AS `I1Venta`,`cfgimpuesto`.`I2Venta` AS `I2Venta`,`cfgimpuesto`.`I3Venta` AS `I3Venta`,`cfgimpuesto`.`I4Venta` AS `I4Venta`,`cfgimpuesto`.`Nombre` AS `Nombre`,if(isnull(`qpartidasvariables`.`Partidas`),0,`qpartidasvariables`.`Partidas`) AS `Variables`,`producto`.`Lim2` AS `Lim2`,`producto`.`Lim3` AS `Lim3`,`producto`.`Lim4` AS `Lim4`,`producto`.`Lim5` AS `Lim5`,`producto`.`flagLimites` AS `flagLimites`,`producto`.`Unidad` AS `Unidad`,`producto`.`FactorB` AS `FactorB` from ((`cfgimpuesto` join (`divisa` join `producto` on((`divisa`.`Sys_PK` = `producto`.`IDivisa`))) on((`cfgimpuesto`.`Sys_PK` = `producto`.`Impuestos`))) left join `qpartidasvariables` on((`producto`.`Sys_PK` = `qpartidasvariables`.`PKProducto`))) where (`producto`.`Visible` <> 0) order by `producto`.`Descripcion` 
;

DROP TABLE IF EXISTS `qpartidasvariables`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `qpartidasvariables` AS select `ivariable`.`FK_Producto_IVariables` AS `PKProducto`,count(`ivariable`.`FK_Producto_IVariables`) AS `Partidas` from (`ivariable` join `grupoproductos` on((`grupoproductos`.`Sys_PK` = `ivariable`.`Grupo`))) group by `ivariable`.`FK_Producto_IVariables` 
;

DROP TABLE IF EXISTS `qproddmnsxcprod`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `qproddmnsxcprod` AS select `qproddmns`.`Sys_PK` AS `Sys_PK`,`qproddmns`.`Descripcion` AS `Descripcion`,`qproddmns`.`Precio1` AS `Precio1`,`qproddmns`.`Precio2` AS `Precio2`,`qproddmns`.`Precio3` AS `Precio3`,`qproddmns`.`Precio4` AS `Precio4`,`qproddmns`.`Precio5` AS `Precio5`,`qproddmns`.`Color` AS `Color`,`qproddmns`.`Data1` AS `Data1`,`qproddmns`.`VincularData` AS `VincularData`,`qproddmns`.`IClase` AS `IClase`,`qproddmns`.`ITipo` AS `ITipo`,`qproddmns`.`ILinea` AS `ILinea`,`qproddmns`.`IDivisa` AS `IDivisa`,`qproddmns`.`TCambio` AS `TCambio`,`qproddmns`.`I1Venta` AS `I1Venta`,`qproddmns`.`I2Venta` AS `I2Venta`,`qproddmns`.`I3Venta` AS `I3Venta`,`qproddmns`.`I4Venta` AS `I4Venta`,`qproddmns`.`Nombre` AS `Nombre`,`qproddmns`.`Variables` AS `Variables`,`qproddmns`.`Lim2` AS `Lim2`,`qproddmns`.`Lim3` AS `Lim3`,`qproddmns`.`Lim4` AS `Lim4`,`qproddmns`.`Lim5` AS `Lim5`,`qproddmns`.`flagLimites` AS `flagLimites`,`qproddmns`.`Unidad` AS `Unidad`,`qproddmns`.`FactorB` AS `FactorB`,`cproduccion_producto_`.`ICentrosProduccion` AS `ICentrosProduccion` from (`cproduccion_producto_` join `qproddmns` on((`cproduccion_producto_`.`IProductos` = `qproddmns`.`Sys_PK`))) 
;

DROP TABLE IF EXISTS `qventasserviciomesa`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `qventasserviciomesa` AS select `venta`.`Sys_PK` AS `Sys_PK`,`venta`.`Sys_TimeStamp` AS `Sys_TimeStamp`,`venta`.`Sys_GUID` AS `Sys_GUID`,`venta`.`Sys_DTCreated` AS `Sys_DTCreated`,`venta`.`Sys_User` AS `Sys_User`,`venta`.`Sys_LastUser` AS `Sys_LastUser`,`venta`.`Sys_Exported` AS `Sys_Exported`,`venta`.`Sys_DTExported` AS `Sys_DTExported`,`venta`.`Sys_Info` AS `Sys_Info`,`venta`.`Auditado` AS `Auditado`,`venta`.`Contabilizado` AS `Contabilizado`,`venta`.`Descuento1` AS `Descuento1`,`venta`.`Descuento2` AS `Descuento2`,`venta`.`dmnsMesa` AS `dmnsMesa`,`venta`.`dmnsNota` AS `dmnsNota`,`venta`.`dmnsPersonas` AS `dmnsPersonas`,`venta`.`Documento` AS `Documento`,`venta`.`DomicilioEntrega` AS `DomicilioEntrega`,`venta`.`Fecha` AS `Fecha`,`venta`.`FEmbarque` AS `FEmbarque`,`venta`.`FEntrega` AS `FEntrega`,`venta`.`FLiquidacion` AS `FLiquidacion`,`venta`.`FormaPago` AS `FormaPago`,`venta`.`FUltimoCobro` AS `FUltimoCobro`,`venta`.`ImporteAdicional` AS `ImporteAdicional`,`venta`.`Impuesto1` AS `Impuesto1`,`venta`.`Impuesto2` AS `Impuesto2`,`venta`.`Impuesto3` AS `Impuesto3`,`venta`.`Impuesto4` AS `Impuesto4`,`venta`.`Notas` AS `Notas`,`venta`.`Partida` AS `Partida`,`venta`.`PComision` AS `PComision`,`venta`.`Poliza` AS `Poliza`,`venta`.`Referencia` AS `Referencia`,`venta`.`StatusAdministrativo` AS `StatusAdministrativo`,`venta`.`StatusEntrega` AS `StatusEntrega`,`venta`.`StatusFacturacion` AS `StatusFacturacion`,`venta`.`StatusFinanciero` AS `StatusFinanciero`,`venta`.`Subtotal` AS `Subtotal`,`venta`.`TipoCambio` AS `TipoCambio`,`venta`.`TipoDomicilio` AS `TipoDomicilio`,`venta`.`txtGuia` AS `txtGuia`,`venta`.`Vencimiento` AS `Vencimiento`,`venta`.`AplicadoA` AS `AplicadoA`,`venta`.`IAgente` AS `IAgente`,`venta`.`ICaja` AS `ICaja`,`venta`.`ICConsumo` AS `ICConsumo`,`venta`.`ICliente` AS `ICliente`,`venta`.`ICorte` AS `ICorte`,`venta`.`IDivisa` AS `IDivisa`,`venta`.`IFolio` AS `IFolio`,`venta`.`IGuia` AS `IGuia`,`venta`.`IMovCaja` AS `IMovCaja`,`venta`.`IPorteador` AS `IPorteador`,`venta`.`IRepartidor` AS `IRepartidor`,`venta`.`uf_Color` AS `uf_Color`,`venta`.`sys_recver` AS `sys_recver`,`venta`.`sys_deleted` AS `sys_deleted`,`venta`.`sys_lock` AS `sys_lock`,((((((`venta`.`Subtotal` - `venta`.`Descuento1`) - `venta`.`Descuento2`) + `venta`.`Impuesto1`) + `venta`.`Impuesto2`) + `venta`.`Impuesto3`) + `venta`.`Impuesto4`) AS `Total` from `venta` where (((`venta`.`StatusAdministrativo` = 1) or (`venta`.`StatusAdministrativo` = 2)) and (`venta`.`dmnsMesa` <> _latin1'') and (`venta`.`dmnsMesa` is not null)) 
;

DROP TABLE IF EXISTS `qlineasxcprod`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `qlineasxcprod` AS select distinct `linea`.`Sys_PK` AS `Sys_PK`,`linea`.`Codigo` AS `Codigo`,`linea`.`Descripcion` AS `Descripcion`,`linea`.`Color` AS `Color`,`cproduccion_producto_`.`ICentrosProduccion` AS `ICProduccion`,`linea`.`Visible` AS `Visible` from ((`linea` join `producto` on((`linea`.`Sys_PK` = `producto`.`ILinea`))) join `cproduccion_producto_` on((`producto`.`Sys_PK` = `cproduccion_producto_`.`IProductos`))) where (`linea`.`Clase` = 2) order by `linea`.`Codigo` 
;

DROP TABLE IF EXISTS `qrydetallecorte`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `qrydetallecorte` AS select `movcaja`.`Sys_PK` AS `Folio`,`movcaja`.`Fecha` AS `Fecha`,`movcaja`.`Hora` AS `Hora`,`movcaja`.`Referencia` AS `Referencia`,`categoria`.`Descripcion` AS `Categoria`,`cdocumentos`.`Const` AS `Documento`,`movcaja`.`Efectivo` AS `Efectivo`,`movcaja`.`Cheques` AS `Cheques`,`movcaja`.`Tarjetas` AS `Tarjetas`,`movcaja`.`Vales` AS `Vales`,`movcaja`.`Depositos` AS `Depositos`,`divisa`.`Descripcion` AS `Divisa`,((((`movcaja`.`Efectivo` + `movcaja`.`Cheques`) + `movcaja`.`Tarjetas`) + `movcaja`.`Vales`) + `movcaja`.`Depositos`) AS `Total`,`movcaja`.`Notas` AS `Notas`,`movcaja`.`ICorte` AS `ICorte`,`corte`.`ICaja` AS `ICaja` from (`divisa` join (`corte` join (`categoria` join (`cdocumentos` join `movcaja` on((`cdocumentos`.`ID` = `movcaja`.`Documento`))) on((`categoria`.`Sys_PK` = `movcaja`.`ICategoria`))) on((`corte`.`Sys_PK` = `movcaja`.`ICorte`))) on((`divisa`.`Sys_PK` = `movcaja`.`IDivisa`))) order by `movcaja`.`Fecha`,`movcaja`.`Hora` 
;

