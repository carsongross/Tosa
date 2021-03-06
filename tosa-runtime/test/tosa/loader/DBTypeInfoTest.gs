package tosa.loader

uses java.io.*
uses java.lang.*
uses java.util.Map
uses gw.lang.reflect.IPropertyInfo
uses gw.lang.reflect.features.PropertyReference
uses org.junit.Assert
uses org.junit.Before
uses org.junit.BeforeClass
uses org.junit.Test
uses test.testdb.Bar
uses test.testdb.SortPage
uses test.testdb.Foo
uses test.testdb.Baz
uses gw.lang.reflect.TypeSystem
uses tosa.api.EntityCollection
uses tosa.api.QueryResult
uses tosa.impl.md.DatabaseImplSource
uses gw.lang.reflect.IType
uses tosa.TosaDBTestBase

class DBTypeInfoTest extends TosaDBTestBase {

  static final var NUM_FOOS = 1

  private static var _barId : long
  private static var _fooId : long
  private static var _bazId : long
  private static var _sortPageId : long

  private function importSampleData() {
    var bar = new Bar(){:Date = new java.sql.Date(new java.util.Date("4/22/2009").Time), :Misc = "misc"}
    bar.update()
    _barId = bar.id
    new SortPage(){:Number = 1}.update()
    new SortPage(){:Number = 2}.update()
    new SortPage(){:Number = 3}.update()
    new SortPage(){:Number = 4}.update()
    new SortPage(){:Number = 5}.update()
    new SortPage(){:Number = 1}.update()
    new SortPage(){:Number = 2}.update()
    new SortPage(){:Number = 3}.update()
    new SortPage(){:Number = 4}.update()
    new SortPage(){:Number = 5}.update()
    new SortPage(){:Number = 1}.update()
    new SortPage(){:Number = 2}.update()
    new SortPage(){:Number = 3}.update()
    new SortPage(){:Number = 4}.update()
    new SortPage(){:Number = 5}.update()
    var sortPage16 = new SortPage(){:Number = 1}
    sortPage16.update()
    _sortPageId = sortPage16.id
    new SortPage(){:Number = 2}.update()
    new SortPage(){:Number = 3}.update()
    new SortPage(){:Number = 4}.update()
    new SortPage(){:Number = 5}.update()


    var foo =new Foo(){:FirstName = "Charlie", :LastName="Brown", :Bar=bar, :Address="1234 Main St.\nCentreville, KS 12345", :Named = sortPage16}
    foo.update()
    _fooId = foo.id

    var baz = new Baz(){:Text = "First"}
    baz.update()
    _bazId = baz.id

    foo.Bazs.add(baz)
    foo.update()

    bar.Relatives.add(baz)
    bar.update()
  }

  @Before
  override function beforeTestMethod() {
    super.beforeTestMethod()
    importSampleData()
  }

  @Test
  function testTypesCreated() {
      var types = gw.lang.reflect.TypeSystem.getAllTypeNames().where(\ c -> c.toString().startsWith("test.testdb."))

      // TODO H2 returns many tables from INFORMATION_SCHEMA - filter out?
//      assertEquals("Too many types:\n${types.join("\n")}", 3, types.Count)

      assertTrue(types.contains("test.testdb.Foo"))
      assertTrue(types.contains("test.testdb.Bar"))
      assertTrue(types.contains("test.testdb.Baz"))
      assertTrue(types.contains("test.testdb.Transaction"))
      assertTrue(types.contains("test.testdb.Database"))
  }

  @Test
  function testPropertiesCreated() {
      var typeinfo = test.testdb.Foo.Type.TypeInfo
      assertEquals(11, typeinfo.Properties.Count)

      var idProp = typeinfo.getProperty("id")
      assertNotNull(idProp)
      assertEquals(Long, idProp.FeatureType)

      var firstNameProp = typeinfo.getProperty("FirstName")
      assertNotNull(firstNameProp)
      assertEquals(String, firstNameProp.FeatureType)

      var lastNameProp = typeinfo.getProperty("LastName")
      assertNotNull(lastNameProp)
      assertEquals(String, lastNameProp.FeatureType)

      var fkProp = typeinfo.getProperty("Bar")
      assertNotNull(fkProp)
      assertEquals(test.testdb.Bar, fkProp.FeatureType)

      var namedFkProp = typeinfo.getProperty("Named")
      assertNotNull(namedFkProp)
      assertEquals(test.testdb.SortPage, namedFkProp.FeatureType)

      var textProp = typeinfo.getProperty("Address")
      assertNotNull(textProp)
      assertEquals(String, textProp.FeatureType)

      var joinProp = typeinfo.getProperty("Bazs")
      assertNotNull(joinProp)
      assertEquals(EntityCollection<test.testdb.Baz>, joinProp.FeatureType)

      typeinfo = test.testdb.Bar.Type.TypeInfo
      assertEquals(9, typeinfo.Properties.Count)

      idProp = typeinfo.getProperty("id")
      assertNotNull(idProp)
      assertEquals(Long, idProp.FeatureType)

      var miscProp = typeinfo.getProperty("Misc")
      assertNotNull(miscProp)
      assertEquals(String, miscProp.FeatureType)

      var dateProp = typeinfo.getProperty("Date")
      assertNotNull(dateProp)
      assertEquals(java.util.Date, dateProp.FeatureType)

      var arrayProp = typeinfo.getProperty("Foos")
      assertNotNull(arrayProp)
      assertEquals(EntityCollection<test.testdb.Foo>, arrayProp.FeatureType)
      assertFalse(arrayProp.Writable)

      joinProp = typeinfo.getProperty("Relatives")
      assertNotNull(joinProp)
      assertEquals(EntityCollection<test.testdb.Baz>, joinProp.FeatureType)
  }

  @Test
  function testBasicMethodsCreated() {
      var typeinfo : gw.lang.reflect.ITypeInfo = test.testdb.Foo.Type.TypeInfo

      var getMethod = typeinfo.getMethod("fromID", {long})
      assertNotNull(getMethod)
      assertTrue(getMethod.Static)
      assertEquals(test.testdb.Foo, getMethod.ReturnType)

      var updateMethod = typeinfo.getMethod("update", {})
      assertNotNull(updateMethod)

      var deleteMethod = typeinfo.getMethod("delete", {})
      assertNotNull(deleteMethod)

      var selectMethod = typeinfo.getMethod("select", {String, Map<String, Object>})
      assertNotNull(selectMethod)
      assertTrue(selectMethod.Static)
      assertEquals(QueryResult<test.testdb.Foo>, selectMethod.ReturnType)

      var selectWhereMethod = typeinfo.getMethod("selectWhere", {String, Map<String, Object>})
      assertNotNull(selectWhereMethod)
      assertTrue(selectWhereMethod.Static)
      assertEquals(QueryResult<test.testdb.Foo>, selectWhereMethod.ReturnType)

      var selectLikeMethod = typeinfo.getMethod("selectLike", {test.testdb.Foo})
      assertNotNull(selectLikeMethod)
      assertTrue(selectLikeMethod.Static)
      assertEquals(QueryResult<test.testdb.Foo>, selectLikeMethod.ReturnType)
    
    var selectAllMethod = typeinfo.getMethod("selectAll", {})
    assertNotNull(selectAllMethod)
    assertTrue(selectAllMethod.Static)
    assertEquals(QueryResult<test.testdb.Foo>, selectAllMethod.ReturnType)

      var countMethod = typeinfo.getMethod("count", {String, Map<String, Object>})
      assertNotNull(countMethod)
      assertTrue(countMethod.Static)
      assertEquals(long, countMethod.ReturnType)

      var countWhereMethod = typeinfo.getMethod("countWhere", {String, Map<String, Object>})
      assertNotNull(countWhereMethod)
      assertTrue(countWhereMethod.Static)
      assertEquals(long, countWhereMethod.ReturnType)

      var countLikeMethod = typeinfo.getMethod("countLike", {test.testdb.Foo})
      assertNotNull(countLikeMethod)
      assertTrue(countLikeMethod.Static)
      assertEquals(long, countLikeMethod.ReturnType)

    var countAllMethod = typeinfo.getMethod("countAll", {})
    assertNotNull(countAllMethod)
    assertTrue(countAllMethod.Static)
    assertEquals(long, countAllMethod.ReturnType)
  }

  @Test
  function testGetMethod() {
      var foo = test.testdb.Foo.fromId(_fooId)
      assertNotNull(foo)
      assertEquals("Charlie", foo.FirstName)
      assertEquals("Brown", foo.LastName)

      var noFoo = test.testdb.Foo.fromId(3582053)
      assertNull(noFoo)
  }

  @Test
  function testSelectMethod() {
      var foos = test.testdb.Foo.select("SELECT * FROM Foo where FirstName='Charlie'").toList()
      assertEquals(1, foos.Count)
      var foo = foos[0]
      assertEquals("Charlie", foo.FirstName)
      assertEquals("Brown", foo.LastName)

      var noFoo = test.testdb.Foo.select("SELECT * FROM Foo where FirstName='Rupert'")
      assertEquals(0, noFoo.Count)
  }

  @Test
  function testSelectWithJoin() {
      var foos = test.testdb.Foo.select("SELECT * FROM Foo inner join SortPage on SortPage.id = Foo.Named_SortPage_id where SortPage.Number = 1").toList()
      assertEquals(1, foos.Count)
      var foo = foos[0]
      assertEquals("Charlie", foo.FirstName)
      assertEquals("Brown", foo.LastName)
      assertEquals(_fooId, foo.id)
  }

  @Test
  function testSelectLikeWithRegularColumns() {
      var foos = test.testdb.Foo.selectLike(new test.testdb.Foo(){:FirstName = "Charlie"}).toList()
      assertEquals(1, foos.Count)
      var foo = foos[0]
      assertEquals("Charlie", foo.FirstName)
      assertEquals("Brown", foo.LastName)

      var noFoo = test.testdb.Foo.selectLike(new test.testdb.Foo(){:FirstName = "Rupert"}).toList()
      assertEquals(0, noFoo.Count)

      var allFoos = test.testdb.Foo.selectLike(new test.testdb.Foo()).toList()
      assertEquals(NUM_FOOS, allFoos.Count)
      allFoos = test.testdb.Foo.selectLike(null).toList()
      assertEquals(NUM_FOOS, allFoos.Count)
  }

  @Test
  function testSelectAllWithOrderBy() {
      var sorted = test.testdb.SortPage.selectAll().orderBy(test.testdb.SortPage#Number, ASC)
      sorted.eachWithIndex(\s, i -> {
        assertTrue(i == 0 or s.Number >= sorted.get(i - 1).Number)
      })
  }

  @Test
  function testSelectAllWithOrderBySql() {
    var sorted = test.testdb.SortPage.selectAll().orderBySql("Number ASC")
    sorted.eachWithIndex(\s, i -> {
      assertTrue(i == 0 or s.Number >= sorted.get(i - 1).Number)
    })
  }

  @Test
  function testSelectAllWithPaging() {
      var fromPage1 = test.testdb.SortPage.selectAll().orderBy(SortPage#id).page(0, 10).toList()
      var fromPage2 = test.testdb.SortPage.selectAll().orderBy(SortPage#id).page(1, 10).toList()
      assertEquals(20, fromPage1.Count)
      assertEquals(10, fromPage2.Count)
      assertEquals(fromPage1[10].Id, fromPage2[0].Id)
  }

  @Test
  function testSelectAllWithOrderByAndPaging() {
    var fromPage1 = test.testdb.SortPage.selectAll().orderBy(SortPage#Number).page(0, 10).toList()
    var fromPage2 = test.testdb.SortPage.selectAll().orderBy(SortPage#Number).page(1, 10).toList()
    assertEquals(20, fromPage1.Count)
    assertEquals(10, fromPage2.Count)
    assertEquals(fromPage1[10].Id, fromPage2[0].Id)

    fromPage1.eachWithIndex(\s, i -> {
        assertTrue(i == 0 or s.Number >= fromPage1[i - 1].Number)
    })
  }

  @Test
  function testCountLike() {
      assertEquals(20, test.testdb.SortPage.countLike(null))
      assertEquals(4, test.testdb.SortPage.countLike(new test.testdb.SortPage(){:Number = 1}))
  }

  @Test
  function testCount() {
      assertEquals(8, test.testdb.SortPage.count("SELECT count(*) as count from SortPage where Number < 3"))
  }

  @Test
  function testSelectLikeWithFK() {
      var bar = test.testdb.Bar.fromId(1)
      var foos = test.testdb.Foo.selectLike(new test.testdb.Foo(){:Bar = bar}).toList()
      assertEquals(1, foos.Count)
      var foo = foos[0]
      assertEquals("Charlie", foo.FirstName)
      assertEquals("Brown", foo.LastName)
  }

  @Test
  function testForeignKey() {
      var foo = test.testdb.Foo.fromId(_fooId)
      assertEquals(_barId, foo.Bar.id)
  }

  @Test
  function testNamedForeignKey() {
      var foo = test.testdb.Foo.fromId(_fooId)
      assertEquals(_sortPageId, foo.Named.id)
      assertEquals(1, foo.Named.Number)
  }

  @Test
  function testArray() {
      var bar = test.testdb.Bar.fromId(_barId)
      var array = bar.Foos.map(\f -> f.id)
      assertEquals(1, array.Count)
      assertEquals(_fooId, array[0])
  }

  @Test
  function testJoinArray() {
      var foo = test.testdb.Foo.fromId(_fooId)
      var array = foo.Bazs.map(\b -> b.id)
      assertEquals(1, array.Count)
      assertEquals(_bazId, array[0])
      var baz = test.testdb.Baz.fromId(_bazId)
      var array2 = baz.Foos.map(\f -> f.id)
      assertEquals(1, array2.Count)
      assertEquals(_fooId, array2[0])
  }

  @Test
  function testNamedJoinArray() {
      var bar = test.testdb.Bar.fromId(_barId)
      var array = bar.Relatives.map(\b -> b.id)
      assertEquals(1, array.Count)
      assertEquals(_barId, array[0])
      var baz = test.testdb.Baz.fromId(_bazId)
      var array2 = baz.Relatives.map(\b -> b.id)
      assertEquals(1, array2.Count)
      assertEquals(_bazId, array2[0])
  }

  @Test
  function testDelete() {
      test.testdb.Foo.fromId(_fooId).delete()
      assertEquals(0, test.testdb.Foo.selectLike(new test.testdb.Foo()).Count)
  }

  @Test
  function testCreateNew() {
      var newFoo = new test.testdb.Foo(){:FirstName = "Linus", :LastName = "Van Pelt"}
      newFoo.update()

      assertNotNull(newFoo.id)
      assertEquals(NUM_FOOS + 1, test.testdb.Foo.selectLike(null).Count)

      var newFooRetrieved = test.testdb.Foo.fromId(newFoo.id)
      assertEquals("Linus", newFooRetrieved.FirstName)
      assertEquals("Van Pelt", newFooRetrieved.LastName)
  }

  @Test
  function testUpdateRegularColumns() {
      var foo = test.testdb.Foo.fromId(_fooId)
      foo.FirstName = "Leroy"
      foo.update()

      var retrievedFoo = test.testdb.Foo.fromId(_fooId)
      assertEquals("Leroy", retrievedFoo.FirstName)
  }

  @Test
  function testUpdateTextColumn() {
      var foo = test.testdb.Foo.fromId(_fooId)
      foo.Address = "54321 Centre Ave.\nMiddleton, IA 52341"
      foo.update()

      var retrievedFoo = test.testdb.Foo.fromId(_fooId)
      assertEquals("54321 Centre Ave.\nMiddleton, IA 52341", retrievedFoo.Address)
  }

  @Test
  function testUpdateDateColumn() {
    var newBar = new test.testdb.Bar()
    var today = java.util.Date.Today
    newBar.Date = today
    newBar.update()

    var retrievedBar = test.testdb.Bar.fromId(newBar.id)
    assertEquals(today, retrievedBar.Date)
  }

  @Test
  function testUpdateFK() {
      var newBar = new test.testdb.Bar()
      newBar.update()

      var foo = test.testdb.Foo.fromId(_fooId)
      foo.Bar = newBar
      foo.update()

      var retrievedFoo = test.testdb.Foo.fromId(_fooId)
      assertEquals(newBar, retrievedFoo.Bar)
  }

  @Test
  function testAddJoin() {
      var newBaz = new test.testdb.Baz()
      newBaz.update()
      var foo = test.testdb.Foo.fromId(_fooId)
      foo.Bazs.add(newBaz)
      assertTrue(foo.Bazs.toList().contains(newBaz))
  }

// TODO - AHK - addAll() doesn't exist on EntityCollection anymore
/*
  @Test
  function testAddAllJoin() {
      var foo = test.testdb.Foo.fromID(_fooId)
      var oldBazsCount = foo.Bazs.Count
      var newBazs : List<test.testdb.Baz> = {}
      for(i in 1..10) {
        var newBaz = new test.testdb.Baz()
        newBaz.update()
        newBazs.add(newBaz)
      }
      foo.Bazs.addAll(newBazs)
      assertEquals(newBazs.Count + oldBazsCount, foo.Bazs.Count)
      for(newBaz in newBazs) {
        assertTrue(foo.Bazs.contains(newBaz))
      }

  }
  */

  @Test
  function testRemoveJoin() {
      var foo = test.testdb.Foo.fromId(_fooId)
      foo.Bazs.remove(test.testdb.Baz.fromId(_bazId))
      assertEquals(0, foo.Bazs.Count)
  }

  @Test
  function testAddNamedJoin() {
      var newBaz = new test.testdb.Baz()
      newBaz.update()
      var bar = test.testdb.Bar.fromId(_barId)
      bar.Relatives.add(newBaz)
      assertTrue(bar.Relatives.toList().contains(newBaz))
  }

  @Test
  function testRemoveNamedJoin() {
      var bar = test.testdb.Bar.fromId(_barId)
      bar.Relatives.remove(test.testdb.Baz.fromId(_bazId))
      assertEquals(0, bar.Relatives.Count)
  }

  @Test
  function testSelfJoin() {
    var baz1 = new test.testdb.Baz()
    baz1.update()
    baz1 = test.testdb.Baz.fromId(baz1.id)
    var baz2 = new test.testdb.Baz()
    baz2.update()
    baz2 = test.testdb.Baz.fromId(baz2.id)
    baz1.SelfJoins.add(baz2)
    assertTrue(baz1.SelfJoins.toList().contains(baz2))
    assertTrue(baz2.SelfJoins.Count == 0)
    baz1.SelfJoins.remove(baz2)
    assertTrue(baz1.SelfJoins.Count == 0)
    assertTrue(baz2.SelfJoins.Count == 0)
  }

  @Test
  function testTextColumn() {
      var foo = test.testdb.Foo.fromId(_fooId)
      assertEquals("1234 Main St.\nCentreville, KS 12345", foo.Address)
  }

  @Test
  function testNewProperty() {
      var newFoo = new test.testdb.Foo()
      assertTrue(newFoo.New)

      var oldFoo = test.testdb.Foo.fromId(_fooId)
      assertFalse(oldFoo.New)
  }

  @Test
  function testSingleQuoteEscape() {
      var foo = new test.testdb.Foo(){:FirstName = "It's-a", :LastName = "me!!"}
      foo.update()

      var retrievedFoo = test.testdb.Foo.fromId(foo.id)
      assertEquals("It's-a", retrievedFoo.FirstName)
  }

  @Test
  function testTransactionNoCommit() {
    var foo = test.testdb.Foo.fromId(_fooId)
    using(test.testdb.Transaction.Lock) {
      foo.FirstName = "not committed"
      foo.update()
    }
    assertFalse(test.testdb.Foo.fromId(_fooId).FirstName == "not committed")
  }

  @Test
  function testTransactionCommit() {
    var foo = test.testdb.Foo.fromId(_fooId)
    using(test.testdb.Transaction.Lock) {
      foo.FirstName = "committed"
      foo.update()
      test.testdb.Transaction.commit()
    }
    assertEquals("committed", test.testdb.Foo.fromId(_fooId).FirstName)
  }

}
