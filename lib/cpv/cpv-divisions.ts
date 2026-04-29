export interface CpvDivision {
  code: string
  label: string
}

export const CPV_DIVISIONS: CpvDivision[] = [
  { code: '03', label: 'Land- en bosbouw, visvangst' },
  { code: '09', label: 'Aardolieproducten, brandstoffen, energie' },
  { code: '14', label: 'Mijnbouw, metalen en verwante producten' },
  { code: '15', label: 'Voedingsmiddelen, dranken en tabak' },
  { code: '16', label: 'Landbouwmachines' },
  { code: '18', label: 'Kleding, schoeisel en accessoires' },
  { code: '19', label: 'Leer, textiel, plastic en rubber' },
  { code: '22', label: 'Drukwerk en aanverwante producten' },
  { code: '24', label: 'Chemische producten' },
  { code: '30', label: 'Kantoor- en computerapparatuur' },
  { code: '31', label: 'Elektrische machines en apparatuur' },
  { code: '32', label: 'Radio, tv en communicatieapparatuur' },
  { code: '33', label: 'Medische apparatuur en farmaceutica' },
  { code: '34', label: 'Transport- en hulpapparatuur' },
  { code: '35', label: 'Veiligheids- en brandweeruitrusting' },
  { code: '37', label: 'Sport, spellen en hobbyartikelen' },
  { code: '38', label: 'Laboratorium- en precisieapparatuur' },
  { code: '39', label: 'Meubels, inrichting en schoonmaakproducten' },
  { code: '41', label: 'Drinkwater' },
  { code: '42', label: 'Industriemachines' },
  { code: '43', label: 'Machines voor mijnbouw en bouw' },
  { code: '44', label: 'Bouwmaterialen en hulpproducten' },
  { code: '45', label: 'Bouwwerkzaamheden' },
  { code: '48', label: 'Software en informatiesystemen' },
  { code: '50', label: 'Reparatie en onderhoud' },
  { code: '51', label: 'Installatiediensten' },
  { code: '55', label: 'Hotel- en restaurantdiensten' },
  { code: '60', label: 'Vervoersdiensten' },
  { code: '63', label: 'Ondersteunende transport- en reisdiensten' },
  { code: '64', label: 'Post- en telecommunicatiediensten' },
  { code: '65', label: 'Openbare nutsvoorzieningen (water, gas, elektra)' },
  { code: '66', label: 'Financiele en verzekeringsdiensten' },
  { code: '70', label: 'Vastgoeddiensten' },
  { code: '71', label: 'Architectuur, bouw en ingenieursdiensten' },
  { code: '72', label: 'IT-diensten en consultancy' },
  { code: '73', label: 'Onderzoeks- en ontwikkelingsdiensten' },
  { code: '75', label: 'Bestuur, defensie en sociale zekerheid' },
  { code: '76', label: 'Olie- en gasdiensten' },
  { code: '77', label: 'Land-, tuin- en bosbouwdiensten' },
  { code: '79', label: 'Zakelijke diensten (juridisch, marketing, beveiliging)' },
  { code: '80', label: 'Onderwijs en opleiding' },
  { code: '85', label: 'Gezondheidszorg en welzijn' },
  { code: '90', label: 'Riolering, afvalbeheer en milieu' },
  { code: '92', label: 'Recreatie, cultuur en sport' },
  { code: '98', label: 'Overige gemeenschaps- en persoonlijke diensten' },
]

export function cpvDivisionLabel(code: string): string {
  return CPV_DIVISIONS.find((d) => d.code === code)?.label ?? code
}
