package tosa.loader.data;

import tosa.loader.parser.tree.ColumnDefinition;

import java.sql.Types;

/**
 * Created by IntelliJ IDEA.
 * User: alan
 * Date: 12/26/10
 * Time: 10:51 PM
 * To change this template use File | Settings | File Templates.
 */
public class ColumnData {
  private final String _name;
  private final DBColumnTypeImpl _columnType;
  private final ColumnDefinition _originalDefinition;

  public ColumnData(String name, DBColumnTypeImpl columnType, ColumnDefinition originalDefinition) {
    _name = name;
    _originalDefinition = originalDefinition;

    // TODO - AHK - Total hack
    if (columnType != null) {
      _columnType = columnType;
    } else {
      _columnType = new DBColumnTypeImpl("PlaceHolder", "place holder", DBColumnTypeImpl.STRING_ITYPE, Types.VARCHAR);
    }
  }

  public String getName() {
    return _name;
  }

  public DBColumnTypeImpl getColumnType() {
    return _columnType;
  }

  // TODO - AHK - I'm not sure if this belongs here.  What if the ColumnData comes from some other source?  We'll worry about that later.
  public ColumnDefinition getOriginalDefinition() {
    return _originalDefinition;
  }
}
