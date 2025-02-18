import { renderToStream } from '@react-pdf/renderer';
import { LoaderFunction } from '@remix-run/node';
import { getAllCompanies } from '~/utils/company_details.server';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '1 solid #e0e0e0',
  },
  dateHeader: {
    backgroundColor: '#f0f4f8',
    padding: '12 15',
    marginBottom: 20,
    borderRadius: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  metadata: {
    flexDirection: 'column',  // Changed to column layout
    gap: 8,  // Add spacing between elements
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',  // Allow wrapping for long names
    gap: 8,
  },
  createdAt: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    alignSelf: 'flex-start',  // Align with the start of the container
  },
  section: {
    margin: '15 0',
    padding: '10 15',
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    flexShrink: 1,  // Allow text to shrink if needed
  },
  subHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
    marginTop: 15,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 1.4,
    color: '#4a4a4a',
  },
  contactBlock: {
    backgroundColor: '#ffffff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 4,
    borderLeft: '3 solid #3498db',
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2980b9',
    marginBottom: 5,
  },
  contactInfo: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 3,
  },
  urgent: {
    backgroundColor: '#fff3f3',
    color: '#dc3545',
    padding: '8 12',
    marginBottom: 15,
    borderRadius: 4,
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  requirementsList: {
    marginLeft: 15,
  },
  requirement: {
    fontSize: 11,
    marginBottom: 5,
    color: '#555555',
  },
  remarks: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff9e6',
    borderRadius: 4,
  },
  remarksText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#666666',
    lineHeight: 1.4,
  },
  cardImage: {
    width: '90%',
    height: '80%',
    alignSelf: 'center',
    objectFit: 'contain',
    marginTop: 20,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
});

const fetchImageAsBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return `data:${response.headers.get('content-type')};base64,${Buffer.from(buffer).toString('base64')}`;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getDateString = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Separate component for company details page
const CompanyDetailsPage = ({ company }: any) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <View style={styles.metadata}>
        <View style={styles.companyHeader}>
          <Text style={styles.heading}>Company: {company.company_name}</Text>
        </View>
        <Text style={styles.createdAt}>Created: {formatDate(company.createdAt)}</Text>
      </View>
      {company.urgent && (
        <View style={styles.urgent}>
          <Text>⚠️ Urgent Action Required</Text>
        </View>
      )}
    </View>

    <View style={styles.section}>
      <Text style={styles.subHeading}>Contact Details</Text>
      {company.contacts.map((contact: any, index: number) => (
        <View key={index} style={styles.contactBlock}>
          <Text style={styles.contactTitle}>Contact {index + 1}</Text>
          <Text style={styles.contactInfo}>Name: {contact.name}</Text>
          <Text style={styles.contactInfo}>Email: {contact.email}</Text>
          <Text style={styles.contactInfo}>Mobile: {contact.mobile_no}</Text>
        </View>
      ))}

      <Text style={styles.text}>Address: {company.address}</Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.subHeading}>Requirements</Text>
      <View style={styles.requirementsList}>
        {company.requirements.map((req: string, index: number) => (
          <Text key={index} style={styles.requirement}>• {req}</Text>
        ))}
        {company.other_requirements && (
          <Text style={styles.requirement}>Additional: {company.other_requirements}</Text>
        )}
      </View>
    </View>

    {company.remarks && (
      <View style={styles.remarks}>
        <Text style={styles.subHeading}>Remarks</Text>
        <Text style={styles.remarksText}>{company.remarks}</Text>
      </View>
    )}
  </Page>
);

// Separate component for card image pages
const CardImagePage = ({ base64Image }: { base64Image: string }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.imageContainer}>
      <Image src={base64Image} style={styles.cardImage} />
    </View>
  </Page>
);

// Date header component
const DateHeader = ({ date }: { date: Date }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.dateHeader}>
      <Text style={styles.dateText}>{formatDate(date)}</Text>
    </View>
  </Page>
);

// Main document component
const MyDocument = ({ companies, imageData }: {
  companies: any[],
  imageData: Record<string, string>
}) => {
  // Group companies by date
  const groupedCompanies = companies.reduce((acc, company) => {
    const dateString = getDateString(company.createdAt);
    if (!acc[dateString]) {
      acc[dateString] = [];
    }
    acc[dateString].push(company);
    return acc;
  }, {} as Record<string, typeof companies>);

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedCompanies).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <Document>
      {sortedDates.map(dateString => (
        <>
          <DateHeader key={`date-${dateString}`} date={new Date(dateString)} />
          {groupedCompanies[dateString].map((company: any, index: any) => (
            <>
              <CompanyDetailsPage key={`company-${dateString}-${index}`} company={company} />
              {company.card_images && company.card_images.image_url &&
                company.card_images.image_url.map((url: string, imageIndex: number) => (
                  <CardImagePage
                    key={`image-${dateString}-${index}-${imageIndex}`}
                    base64Image={imageData[url]}
                  />
                ))
              }
            </>
          ))}
        </>
      ))}
    </Document>
  );
};

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const companies = await getAllCompanies();

    // Convert relative URLs to absolute URLs and collect all image URLs
    const baseUrl = new URL(request.url).origin;
    const imageUrls = new Set<string>();

    companies.forEach(company => {
      if (company.card_images && company.card_images.image_url) {
        company.card_images.image_url = company.card_images.image_url.map((url: string) => {
          const fullUrl = url.startsWith('/') ? `${baseUrl}${url}` : url;
          imageUrls.add(fullUrl);
          return fullUrl;
        });
      }
    });

    // Fetch and convert all images to base64
    const imageData: Record<string, string> = {};
    await Promise.all(
      Array.from(imageUrls).map(async (url) => {
        try {
          imageData[url] = await fetchImageAsBase64(url);
        } catch (error) {
          console.error(`Error fetching image from ${url}:`, error);
          imageData[url] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        }
      })
    );

    console.log('Processing PDF generation with image data');
    const stream = await renderToStream(
      <MyDocument
        companies={companies}
        imageData={imageData}
      />
    );

    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      // @ts-ignore
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="company-details.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Response('Error generating PDF', { status: 500 });
  }
};
