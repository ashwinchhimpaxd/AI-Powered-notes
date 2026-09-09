import { Document, Page, Text, View, Image, Link, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', color: '#333' },
  paragraph: { fontSize: 12, marginBottom: 10, lineHeight: 1.5 },
  heading1: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, marginTop: 12 },
  heading2: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  heading3: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, marginTop: 8 },
  listItem: { fontSize: 12, marginBottom: 4, marginLeft: 10 },
  list: { marginBottom: 10, marginLeft: 10 },
  blockquote: { fontSize: 12, fontStyle: 'italic', paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#ccc', marginBottom: 10, color: '#555' },
  image: { width: '100%', marginBottom: 10 },
  link: { color: 'blue', textDecoration: 'underline' },
  bold: { fontWeight: 'bold' },
  italic: { fontStyle: 'italic' },
  underline: { textDecoration: 'underline' }
});


const renderNodes = (nodes) => {
  if (!nodes) return null;

  return nodes.map((node, index) => {
    // Check marks (bold, italic, etc)
    let textStyle = {};
    if (node.marks) {
      node.marks.forEach(mark => {
        if (mark.type === 'bold') textStyle = { ...textStyle, ...styles.bold };
        if (mark.type === 'italic') textStyle = { ...textStyle, ...styles.italic };
        if (mark.type === 'underline') textStyle = { ...textStyle, ...styles.underline };
      });
    }

    switch (node.type) {
      case 'text':
        return <Text key={index} style={textStyle}>{node.text}</Text>;

      case 'paragraph':
        return (
          <Text key={index} style={styles.paragraph}>
            {renderNodes(node.content)}
          </Text>
        );

      case 'heading':
        const level = node.attrs?.level || 1;
        const headingStyle = styles[`heading${level}`] || styles.heading3;
        return (
          <Text key={index} style={headingStyle}>
            {renderNodes(node.content)}
          </Text>
        );

      case 'bulletList':
      case 'orderedList':
        return (
          <View key={index} style={styles.list}>
            {renderNodes(node.content)}
          </View>
        );

      case 'listItem':
        return (
          <View key={index} style={{ flexDirection: 'row' }}>
            <Text style={{ fontSize: 12, marginRight: 5 }}>•</Text>
            <Text style={styles.listItem}>
              {renderNodes(node.content)}
            </Text>
          </View>
        );

      case 'blockquote':
        return (
          <Text key={index} style={styles.blockquote}>
            {renderNodes(node.content)}
          </Text>
        );

      case 'horizontalRule':
        return <View key={index} style={{ borderBottomWidth: 1, borderBottomColor: '#ccc', marginVertical: 15 }} />;

      case 'image':
        return <Image key={index} src={node.attrs?.src} style={styles.image} />;

      case 'link':
        return (
          <Link key={index} src={node.attrs?.href} style={[styles.link, textStyle]}>
            {renderNodes(node.content)}
          </Link>
        );

      default:
        // Render children even if parent is unrecognized
        return renderNodes(node.content);
    }
  });
};
export const ExportPDFStyle = ({ content, title }) => (

  < Document >
    <Page size="A4" style={styles.page}>
      {/* Yahan hum recursive function call kar rahe hain */}
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>{title}</Text>
      {renderNodes(content)}
    </Page>
  </Document >
);