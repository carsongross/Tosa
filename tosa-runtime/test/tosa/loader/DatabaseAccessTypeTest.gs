package tosa.loader

uses java.io.*
uses java.lang.*
uses gw.lang.reflect.IPropertyInfo
uses gw.lang.reflect.features.PropertyReference
uses org.junit.Test
uses test.testdb.Bar
uses test.testdb.SortPage
uses test.testdb.Foo
uses test.testdb.Baz
uses gw.lang.reflect.TypeSystem
uses tosa.TosaDBTestBase

class DatabaseAccessTypeTest extends TosaDBTestBase {

  @Test
  function testJdbcUrlPropertyGetter() {
    assertEquals("jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1", test.testdb.Database.JdbcUrl)
  }

  @Test
  function testChangingJdbcUrlAlongWithCreateTablesAndDropTables() {
    // Yeah, yeah, I know these should be separate tests . . . but it's kind of hard to write a test
    // for dropTables() without calling createTables(), and it's hard to call createTables() without
    // changing to a known-clean jbdc url, so I figured I'd just combine it all in one messy test
    var originalUrl = test.testdb.Database.JdbcUrl
    try {
      // Reset the JdbcUrl
      test.testdb.Database.JdbcUrl = "jdbc:h2:mem:some_other_testdb;DB_CLOSE_DELAY=-1"
      // Now create the tables in that new DB; if the JdbcUrl hasn't actually changed, this will blow up
      test.testdb.Database.createTables()
      var foo = new Foo(){:FirstName = "Charlie", :LastName="Brown", :Address="1234 Main St.\nCentreville, KS 12345"}
      foo.update()
      assertEquals(1, Foo.countLike(new Foo(){:FirstName = "Charlie"}))

      // Dropping the tables should cause the next query to throw an exception
      test.testdb.Database.dropTables()
      try {
        Foo.countLike(new Foo(){:FirstName = "Charlie"})
        fail("Expected an exception")
      } catch (e : Exception) {
        // Expected
      }

      // Now switch back to the original DB and verify that's not there
      test.testdb.Database.JdbcUrl = originalUrl
      assertEquals(0, Foo.countLike(new Foo(){:FirstName = "Charlie"}))
    } finally {
      test.testdb.Database.JdbcUrl = originalUrl
    }
  }
}
